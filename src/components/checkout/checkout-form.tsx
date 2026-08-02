"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore, useCartHasHydrated } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

interface PickupLocationOption {
  id: string;
  name: string;
}

export function CheckoutForm({
  locale,
  pickupLocations,
  flatRatePrice,
  freeShippingAbove,
}: {
  locale: Locale;
  pickupLocations: PickupLocationOption[];
  flatRatePrice: number;
  freeShippingAbove: number | null;
}) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartHasHydrated();

  const [deliveryType, setDeliveryType] = useState<"SHIPPING" | "PICKUP">("SHIPPING");
  const [contactName, setContactName] = useState(session?.user?.name ?? "");
  const [contactEmail, setContactEmail] = useState(session?.user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupLocationId, setPickupLocationId] = useState(pickupLocations[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingCost = useMemo(() => {
    if (deliveryType === "PICKUP") return 0;
    if (freeShippingAbove !== null && subtotal >= freeShippingAbove) return 0;
    return flatRatePrice;
  }, [deliveryType, subtotal, flatRatePrice, freeShippingAbove]);
  const total = subtotal + shippingCost;

  if (hasHydrated && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center animate-fade-up">
        <p className="text-ink-soft">{t("errors.empty_cart")}</p>
        <Link href="/" className="text-sm font-medium text-ink transition-colors hover:text-gold">
          {tCart("continueShopping")}
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        contactName,
        contactEmail,
        contactPhone,
        notes: notes || undefined,
        deliveryType,
        address:
          deliveryType === "SHIPPING"
            ? { city, street, zip: zip || undefined, phone: contactPhone }
            : undefined,
        pickupLocationId: deliveryType === "PICKUP" ? pickupLocationId : undefined,
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      }),
    });

    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      const knownErrors = ["empty_cart", "insufficient_stock", "missing_address", "missing_pickup_location"] as const;
      const key = (knownErrors as readonly string[]).includes(body.error ?? "")
        ? (body.error as (typeof knownErrors)[number])
        : "generic";
      setError(t(`errors.${key}`));
      setSubmitting(false);
      return;
    }

    const { redirectUrl } = await res.json();
    window.location.href = redirectUrl;
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr] md:gap-14 md:px-6 md:py-16 animate-fade-up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <h1 className="font-serif text-2xl tracking-wide md:text-3xl">{t("title")}</h1>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("contactSection")}</h2>
          <TextField label={t("nameLabel")} required value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <TextField
            label={t("emailLabel")}
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <TextField label={t("phoneLabel")} type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("deliveryType")}</h2>
          <div className="flex gap-6 text-sm">
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="deliveryType"
                checked={deliveryType === "SHIPPING"}
                onChange={() => setDeliveryType("SHIPPING")}
                className="h-4 w-4 accent-gold"
              />
              {t("shippingOption")}
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="deliveryType"
                checked={deliveryType === "PICKUP"}
                onChange={() => setDeliveryType("PICKUP")}
                className="h-4 w-4 accent-gold"
              />
              {t("pickupOption")}
            </label>
          </div>

          {deliveryType === "SHIPPING" ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("addressSection")}</h3>
              <TextField label={t("cityLabel")} required value={city} onChange={(e) => setCity(e.target.value)} />
              <TextField label={t("streetLabel")} required value={street} onChange={(e) => setStreet(e.target.value)} />
              <TextField label={t("zipLabel")} value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          ) : (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink/70">{t("pickupLocationLabel")}</span>
              <select
                required
                value={pickupLocationId}
                onChange={(e) => setPickupLocationId(e.target.value)}
                className="min-h-11 rounded-sm border border-ink/20 bg-transparent px-3.5 py-2.5 focus:border-gold focus:outline-none"
              >
                <option value="" disabled>
                  {t("selectPickupLocation")}
                </option>
                {pickupLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <TextField label={t("notesLabel")} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? t("placingOrder") : t("placeOrder")}
        </Button>
      </form>

      <aside className="h-fit rounded-sm border border-line bg-cream-deep/40 p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-soft">{t("orderSummary")}</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink/75">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span>
                {item.productName} &middot; {item.colorName} &middot; {item.sizeLabel} &times; {item.quantity}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span>{t("subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("shipping")}</span>
            <span>{shippingCost === 0 ? t("freeShipping") : formatPrice(shippingCost, locale)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>{t("total")}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
