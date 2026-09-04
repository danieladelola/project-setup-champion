/**
 * Minimal, Worker-safe Stripe client. Uses fetch + form encoding instead of the
 * Node SDK so it runs unchanged in the edge runtime.
 */

const STRIPE_API = "https://api.stripe.com/v1";

export class StripeConfigError extends Error {}

export function getStripeSecretKey() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new StripeConfigError(
      "STRIPE_SECRET_KEY is not set on the server. Add it to the deployment environment variables.",
    );
  }
  return key;
}

/** Flattens a nested object into Stripe's bracketed form-encoding. */
function encode(value: unknown, prefix = "", out = new URLSearchParams()): URLSearchParams {
  if (value === undefined || value === null) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => encode(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      encode(v, prefix ? `${prefix}[${k}]` : k, out);
    }
    return out;
  }
  out.append(prefix, String(value));
  return out;
}

async function stripeRequest<T>(
  path: string,
  body?: Record<string, unknown>,
  method: "GET" | "POST" = "POST",
): Promise<T> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    ...(body ? { body: encode(body).toString() } : {}),
  });
  const payload = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) {
    // Log the provider detail server-side, surface a safe message.
    console.error("stripe error", path, payload.error);
    throw new Error(payload.error?.message ?? "Payment provider request failed");
  }
  return payload as T;
}

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string>;
};

export type CheckoutLine = {
  name: string;
  unit_price: number;
  quantity: number;
};

/**
 * Hosted Stripe Checkout with card + Klarna. Klarna is a GBP/EUR-style
 * pay-later method: Stripe only renders it when the buyer and currency are
 * eligible, so listing it here is safe for every order.
 */
export async function createCheckoutSession(params: {
  orderId: string;
  orderNumber: string;
  email: string;
  lines: CheckoutLine[];
  deliveryFee: number;
  origin: string;
}) {
  const line_items = params.lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "gbp",
      unit_amount: Math.round(line.unit_price * 100),
      product_data: { name: line.name },
    },
  }));

  if (params.deliveryFee > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(params.deliveryFee * 100),
        product_data: { name: "Delivery" },
      },
    });
  }

  return await stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    mode: "payment",
    customer_email: params.email,
    client_reference_id: params.orderNumber,
    payment_method_types: ["card", "klarna"],
    line_items,
    metadata: { order_id: params.orderId, order_number: params.orderNumber },
    payment_intent_data: {
      metadata: { order_id: params.orderId, order_number: params.orderNumber },
    },
    success_url: `${params.origin}/order-success/${params.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/checkout?cancelled=1`,
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  return await stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    undefined,
    "GET",
  );
}

/** Constant-time-ish comparison of two hex digests. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifies a Stripe webhook signature (t=…,v1=…) using WebCrypto so it works
 * in the edge runtime.
 */
export async function verifyStripeSignature(payload: string, header: string | null) {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) throw new StripeConfigError("STRIPE_WEBHOOK_SECRET is not set on the server.");
  if (!header) return false;

  const parts = new Map(
    header.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k?.trim() ?? "", rest.join("=").trim()];
    }),
  );
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature) return false;

  // Reject replays older than 5 minutes.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return safeEqual(expected, signature);
}
