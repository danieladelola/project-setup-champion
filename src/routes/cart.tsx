import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatPrice, useCart } from "@/lib/cart";

const title = "Your Cart — Mayor Beauty Place";
const description = "Review the beauty products in your Mayor Beauty Place bag before checkout.";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const empty = cart.hydrated && cart.items.length === 0;

  return (
    <main className="px-6 pt-40 pb-24 md:px-12 md:pt-52">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-5xl">Your Cart</h1>

        {!cart.hydrated ? (
          <div className="mt-10 h-32 animate-pulse rounded-3xl bg-secondary" />
        ) : empty ? (
          <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Your cart is empty. Add a product before proceeding to checkout.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-xs font-semibold text-on-dark hover:bg-brand-blue"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 space-y-4">
              {cart.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <Link
                    to="/shop/$slug"
                    params={{ slug: item.slug }}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        width={160}
                        height={160}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-40 flex-1">
                    <Link
                      to="/shop/$slug"
                      params={{ slug: item.slug }}
                      className="font-display text-lg hover:text-brand-red"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => cart.setQuantity(item.product_id, item.quantity - 1)}
                      className="p-2.5"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => cart.setQuantity(item.product_id, item.quantity + 1)}
                      className="p-2.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="w-24 text-right font-display text-lg">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => cart.remove(item.product_id)}
                    className="rounded-full p-2 text-muted-foreground hover:text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Subtotal</p>
                <p className="font-display text-3xl text-brand-red">
                  {formatPrice(cart.subtotal)}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/shop"
                  className="inline-flex rounded-full border border-ink px-6 py-3 text-xs font-semibold hover:bg-secondary"
                >
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/checkout" })}
                  className="inline-flex rounded-full bg-ink px-6 py-3 text-xs font-semibold text-on-dark hover:bg-brand-blue"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
