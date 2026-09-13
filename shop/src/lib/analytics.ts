import { API_URL, TOKEN_KEY } from "../api";

const SESSION_KEY = "retailflow-session-id";

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

function getDevice(): "mobile" | "desktop" {
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

export type AnalyticsEventType =
  | "homepage_viewed"
  | "search_performed"
  | "search_result_clicked"
  | "product_viewed"
  | "product_added_to_cart"
  | "product_removed_from_cart"
  | "checkout_started"
  | "purchase_completed"
  | "recommendation_viewed"
  | "recommendation_clicked"
  | "product_filtered"
  | "product_sorted"
  | "order_cancelled";

interface TrackOptions {
  productId?: number;
  metadata?: Record<string, unknown>;
}

// Fire-and-forget: analytics must never block or break the shopping
// experience, so failures are swallowed rather than surfaced.
export function track(eventType: AnalyticsEventType, options: TrackOptions = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  fetch(`${API_URL}/analytics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      eventType,
      sessionId: getSessionId(),
      device: getDevice(),
      ...options,
    }),
    keepalive: true,
  }).catch(() => {
    // Ignored — analytics is best-effort.
  });
}
