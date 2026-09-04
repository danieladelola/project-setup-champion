import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { publicApi } from "@/lib/admin-api";
import { formatPrice, useCart } from "@/lib/cart";

const title = "Checkout — Mayor Beauty Place";
const description = "Complete your Mayor Beauty Place order with secure delivery details.";

export const Route = createFileRoute("/checkout")({
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
  component: CheckoutPage,
});

const FIELDS = [
  { name: "first_name", label: "First Name", type: "text", required: true },
  { name: "last_name", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone Number", type: "tel", required: true },
  { name: "address", label: "Address", type: "text", required: true, full: true },
  { name: "city", label: "City", type: "text", required: true },
  { name: "state", label: "State / County", type: "text", required: true },
  { name: "country", label: "Country", type: "text", required: true },
] as Array<{ name: string; label: string; type: string; required: boolean; full?: boolean }>;

function CheckoutPage() {
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const deliveryFee = 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (cart.items.length === 0) {
      toast.error("Your cart is empty. Add a product before proceeding to checkout.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();
    const values = new Map<string, string>(
      [...FIELDS.map((f) => f.name), "notes"].map((k) => [k as string, get(k)]),
    );
    const v = (key: string) => values.get(key) ?? "";

    const nextErrors: Record<string, string> = {};
    for (const field of FIELDS) {
      if (!v(field.name)) nextErrors[field.name] = `${field.label} is required`;
    }
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) {
      nextErrors["email"] = "Enter a valid email address";
    }
    if (v("phone") && v("phone").replace(/\D/g, "").length < 7) {
      nextErrors["phone"] = "Enter a valid phone number";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Creates the order in Postgres, then hands off to Stripe Checkout
      // (card + Klarna). The cart is cleared once the redirect is confirmed.
      const res = await publicApi.startCheckout({
        first_name: v("first_name"),
        last_name: v("last_name"),
        email: v("email"),
        phone: v("phone"),
        address: v("address"),
        city: v("city"),
        state: v("state"),
        country: v("country"),
        ...(v("notes") ? { notes: v("notes") } : {}),
        items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      cart.clear();
      window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't start your payment.");
      setSubmitting(false);
    }
  }


  if (cart.hydrated && cart.items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Your cart is empty. Add a product before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-xs font-semibold text-on-dark hover:bg-brand-blue"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  return (
    <main className="px-6 pt-40 pb-24 md:px-12 md:pt-52">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-5xl">Checkout</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className={field.full ? "sm:col-span-2" : undefined}>
                <label htmlFor={field.name} className="text-xs tracking-widest uppercase">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete="on"
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-brand-red">{errors[field.name]}</p>
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="text-xs tracking-widest uppercase">
                Order Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex rounded-full bg-ink px-8 py-4 text-xs font-semibold text-on-dark hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Redirecting to payment…" : "Continue to Secure Payment"}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Order Summary</h2>
            <ul className="mt-5 space-y-4">
              {cart.items.map((item) => (
                <li key={item.product_id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.name}
                    <span className="block text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </span>
                  </span>
                  <span className="font-semibold">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 font-display text-2xl text-brand-red">
                <span>Total</span>
                <span>{formatPrice(cart.subtotal + deliveryFee)}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                Totals are re-verified against our live catalogue, then paid securely via Stripe — card or Klarna.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
