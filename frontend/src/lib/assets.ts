import { ASSET_BASE_URL } from "../services/api";

export function resolveImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return null;
  }

  // Already absolute (e.g. seeded placeholder images) — use as-is.
  // Only relative paths (e.g. /uploads/products/...) need the API base.
  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl;
  }

  return `${ASSET_BASE_URL}${imageUrl}`;
}
