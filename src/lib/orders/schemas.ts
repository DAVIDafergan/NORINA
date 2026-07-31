import { z } from "zod";

export const checkoutSchema = z.object({
  locale: z.enum(["he", "fr", "en"]),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  notes: z.string().optional(),
  deliveryType: z.enum(["SHIPPING", "PICKUP"]),
  address: z
    .object({
      city: z.string().min(1),
      street: z.string().min(1),
      zip: z.string().optional(),
      phone: z.string().min(1),
      notes: z.string().optional(),
    })
    .optional(),
  pickupLocationId: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});
