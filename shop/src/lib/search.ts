import type { Category } from "../types";

// Small edit-distance implementation — no dependency needed for a
// catalog this size (client-side, <50 products).
export function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }

  return dp[a.length][b.length];
}

// Typo-tolerant match: exact substring first (fast path), then falls
// back to a small edit-distance budget per word so e.g. "shrit" still
// finds "shirt".
export function fuzzyMatch(target: string, query: string): boolean {
  const t = target.toLowerCase();
  const q = query.toLowerCase().trim();

  if (!q) return true;
  if (t.includes(q)) return true;

  const maxDistance = q.length <= 4 ? 1 : 2;

  return t.split(/\s+/).some((word) => levenshtein(word, q) <= maxDistance);
}

export interface ParsedQuery {
  text: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
}

const PRICE_PATTERNS: {
  re: RegExp;
  apply: (m: RegExpMatchArray) => { minPrice?: number; maxPrice?: number };
}[] = [
  {
    re: /\bbetween\s*(?:rs\.?|inr|₹)?\s*(\d+)\s*(?:and|-|to)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
    apply: (m) => ({ minPrice: Number(m[1]), maxPrice: Number(m[2]) }),
  },
  {
    re: /\bunder\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
    apply: (m) => ({ maxPrice: Number(m[1]) }),
  },
  {
    re: /\bbelow\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
    apply: (m) => ({ maxPrice: Number(m[1]) }),
  },
  {
    re: /\b(?:above|over)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
    apply: (m) => ({ minPrice: Number(m[1]) }),
  },
];

// Rule-based (not LLM) natural-language parsing: pulls a price range and
// a matching category out of a free-text query, e.g.
// "black running shoes under 3000" -> { text: "black running shoes",
// maxPrice: 3000, categoryId: <Fashion's id> } — assuming a category
// named/matching "shoes" or "fashion" exists in the real catalog.
export function parseSearchQuery(
  query: string,
  categories: Category[]
): ParsedQuery {
  let text = query;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern.re);

    if (match) {
      const result = pattern.apply(match);
      minPrice = result.minPrice ?? minPrice;
      maxPrice = result.maxPrice ?? maxPrice;
      text = text.replace(match[0], "").trim();
      break;
    }
  }

  const lowerText = text.toLowerCase();

  const categoryId = categories.find((category) =>
    lowerText.includes(category.name.toLowerCase())
  )?.id;

  return { text: text.trim(), minPrice, maxPrice, categoryId };
}
