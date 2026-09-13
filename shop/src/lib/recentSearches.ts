const KEY = "retailflow-recent-searches";
const MAX = 6;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();

  if (!trimmed) return;

  const current = getRecentSearches().filter(
    (q) => q.toLowerCase() !== trimmed.toLowerCase()
  );

  localStorage.setItem(
    KEY,
    JSON.stringify([trimmed, ...current].slice(0, MAX))
  );
}

export function clearRecentSearches() {
  localStorage.removeItem(KEY);
}
