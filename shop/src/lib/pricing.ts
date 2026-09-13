// Fabricates a plausible "M.R.P." above the actual selling price so listings
// can show a strikethrough price + discount, the way most catalogs do. The
// real price customers pay is always `product.price` — this never changes it.
export function getListPrice(price: number): number {
  return Math.round((price * 1.28) / 10) * 10 - 1;
}

export function getDiscountPercent(price: number, listPrice: number): number {
  if (listPrice <= price) {
    return 0;
  }

  return Math.round(((listPrice - price) / listPrice) * 100);
}
