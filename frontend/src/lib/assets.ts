import { ASSET_BASE_URL } from "../services/api";

export function resolveImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return null;
  }

  return `${ASSET_BASE_URL}${imageUrl}`;
}
