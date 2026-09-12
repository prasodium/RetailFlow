import OpenAI from "openai";
import prisma from "../../lib/prisma.js";
import { getTopProducts } from "../reports/report.service.js";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const CACHE_TTL_MS = 10 * 60 * 1000;
const CANDIDATE_LIMIT = 150;

// --- In-memory TTL cache (no DB table needed for this) ---

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const hit = cache.get(key);

  if (!hit || hit.expiresAt < Date.now()) {
    return null;
  }

  return hit.data as T;
}

function setCached(key: string, data: unknown) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// --- Lazy OpenAI client (must not construct at module load, or the
// server would crash on startup whenever OPENAI_API_KEY is unset) ---

let client: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (client !== undefined) {
    return client;
  }

  client = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  return client;
}

type ProductWithCategory = Awaited<
  ReturnType<typeof getActiveCandidates>
>[number];

function formatCandidate(product: ProductWithCategory) {
  const description = product.description
    ? product.description.slice(0, 120)
    : "";

  return `id=${product.id} name="${product.name}" category="${product.category.name}" price=${product.price} ${description ? `description="${description}"` : ""}`;
}

async function askModelToRank(options: {
  systemPrompt: string;
  userPrompt: string;
  candidateIds: number[];
  limit: number;
}): Promise<{ id: number; reason: string }[] | null> {
  const openai = getClient();

  if (!openai || options.candidateIds.length === 0) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: options.userPrompt },
        ],
        response_format: { type: "json_object" },
      },
      { timeout: 8000 }
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);
    const recommendations = parsed?.recommendations;

    if (!Array.isArray(recommendations)) {
      return null;
    }

    const candidateSet = new Set(options.candidateIds);

    const filtered = recommendations
      .filter(
        (item: any) =>
          typeof item?.productId === "number" &&
          candidateSet.has(item.productId)
      )
      .slice(0, options.limit)
      .map((item: any) => ({
        id: item.productId,
        reason: typeof item.reason === "string" ? item.reason : "",
      }));

    return filtered.length > 0 ? filtered : null;
  } catch (error) {
    console.error("OpenAI recommendation request failed:", error);
    return null;
  }
}

async function getActiveCandidates(options: {
  excludeIds?: number[];
  categoryIds?: number[];
  limit?: number;
}) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      inventory: {
        quantity: {
          gt: 0,
        },
      },
      ...(options.excludeIds?.length && {
        id: { notIn: options.excludeIds },
      }),
      ...(options.categoryIds?.length && {
        categoryId: { in: options.categoryIds },
      }),
    },
    include: {
      category: true,
      inventory: true,
    },
    take: options.limit ?? CANDIDATE_LIMIT,
  });
}

function rankedProductsFrom(
  ranked: { id: number; reason: string }[],
  candidates: ProductWithCategory[]
) {
  const byId = new Map(candidates.map((c) => [c.id, c]));

  return ranked
    .map((r) => byId.get(r.id))
    .filter((p): p is ProductWithCategory => Boolean(p));
}

async function getBestSellingProducts(limit: number) {
  const top = await getTopProducts();
  const ids = top.slice(0, limit).map((t) => t.productId);

  if (ids.length === 0) {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, inventory: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, inventory: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  return ids.map((id) => byId.get(id)).filter((p): p is typeof products[number] => Boolean(p));
}

const RECOMMENDATION_SYSTEM_PROMPT =
  'You are a product recommendation engine for an online store. Choose only from the given candidate product IDs — never invent an ID. Respond with strict JSON in this exact shape: {"recommendations":[{"productId":number,"reason":string}]}. Keep each reason under 15 words.';

export async function getHomeRecommendations(customerId?: number) {
  const cacheKey = `home:${customerId ?? "guest"}`;
  const cached = getCached<ProductWithCategory[]>(cacheKey);

  if (cached) {
    return cached;
  }

  let result: ProductWithCategory[] | null = null;

  if (customerId) {
    const [views, purchasedItems] = await Promise.all([
      prisma.productView.findMany({
        where: { customerId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { product: { include: { category: true } } },
      }),
      prisma.saleItem.findMany({
        where: { sale: { customerId } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { product: { include: { category: true } } },
      }),
    ]);

    const interestCategoryIds = new Set<number>();
    const interestNames: string[] = [];

    for (const view of views) {
      interestCategoryIds.add(view.product.categoryId);
      interestNames.push(view.product.name);
    }

    for (const item of purchasedItems) {
      interestCategoryIds.add(item.product.categoryId);
      interestNames.push(item.product.name);
    }

    if (interestCategoryIds.size > 0) {
      const candidates = await getActiveCandidates({
        categoryIds: [...interestCategoryIds],
      });

      const ranked = await askModelToRank({
        systemPrompt: RECOMMENDATION_SYSTEM_PROMPT,
        userPrompt: `This customer recently viewed or purchased: ${
          interestNames.slice(0, 30).join(", ") || "nothing yet"
        }.\nPick up to 8 candidate products they'd likely want next.\nCandidates:\n${candidates
          .map(formatCandidate)
          .join("\n")}`,
        candidateIds: candidates.map((c) => c.id),
        limit: 8,
      });

      if (ranked) {
        result = rankedProductsFrom(ranked, candidates);
      }
    }
  }

  if (!result || result.length === 0) {
    result = await getBestSellingProducts(8);
  }

  setCached(cacheKey, result);

  return result;
}

export async function getProductRecommendations(productId: number) {
  const cacheKey = `product:${productId}`;
  const cached = getCached<ProductWithCategory[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    return [];
  }

  const candidates = await getActiveCandidates({
    excludeIds: [productId],
    categoryIds: [product.categoryId],
  });

  let result = candidates.slice(0, 6);

  const ranked = await askModelToRank({
    systemPrompt: RECOMMENDATION_SYSTEM_PROMPT,
    userPrompt: `A shopper is viewing: name="${product.name}" category="${
      product.category.name
    }" description="${(product.description ?? "").slice(
      0,
      200
    )}".\nPick up to 6 candidate products they'd also like ("You may also like").\nCandidates:\n${candidates
      .map(formatCandidate)
      .join("\n")}`,
    candidateIds: candidates.map((c) => c.id),
    limit: 6,
  });

  if (ranked) {
    const rankedResult = rankedProductsFrom(ranked, candidates);

    if (rankedResult.length > 0) {
      result = rankedResult;
    }
  }

  setCached(cacheKey, result);

  return result;
}

export async function getCartRecommendations(productIds: number[]) {
  if (productIds.length === 0) {
    return [];
  }

  const cacheKey = `cart:${[...new Set(productIds)].sort().join(",")}`;
  const cached = getCached<ProductWithCategory[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });

  const categoryIds = [...new Set(cartProducts.map((p) => p.categoryId))];

  const candidates = await getActiveCandidates({
    excludeIds: productIds,
    categoryIds,
  });

  let result = candidates.slice(0, 4);

  const ranked = await askModelToRank({
    systemPrompt: RECOMMENDATION_SYSTEM_PROMPT,
    userPrompt: `A shopper's cart currently contains: ${cartProducts
      .map((p) => p.name)
      .join(", ")}.\nPick up to 4 candidate complementary add-ons (upsell) that are NOT already in the cart.\nCandidates:\n${candidates
      .map(formatCandidate)
      .join("\n")}`,
    candidateIds: candidates.map((c) => c.id),
    limit: 4,
  });

  if (ranked) {
    const rankedResult = rankedProductsFrom(ranked, candidates);

    if (rankedResult.length > 0) {
      result = rankedResult;
    }
  }

  setCached(cacheKey, result);

  return result;
}
