// There is no reviews system yet, so ratings are derived deterministically
// from the product id — stable per product, no backend changes needed.
export function getProductRating(productId: number) {
  const seed = (productId * 2654435761) % 100;
  const rating = Math.round((3.8 + (seed % 12) / 10) * 10) / 10;
  const reviewCount = 50 + ((seed * 37) % 4000);

  return { rating, reviewCount };
}
