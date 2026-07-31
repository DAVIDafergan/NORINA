import { z } from "zod";

const localizedText = z.object({ he: z.string().min(1), fr: z.string(), en: z.string() });

export const productInputSchema = z.object({
  name: localizedText,
  description: localizedText,
  categoryId: z.string().min(1),
  basePrice: z.number().positive(),
  isActive: z.boolean(),
});

export const colorInputSchema = z.object({
  name: localizedText,
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  imageUrls: z.array(z.string().url()),
});

export const variantInputSchema = z.object({
  sizeId: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  priceOverride: z.number().positive().nullable().optional(),
});

export const variantUpdateSchema = z.object({
  stockQuantity: z.number().int().min(0).optional(),
  priceOverride: z.number().positive().nullable().optional(),
});

export const shippingSettingSchema = z.object({
  flatRatePrice: z.number().min(0),
  freeShippingAbove: z.number().min(0).nullable(),
});

export const pickupLocationInputSchema = z.object({
  cityName: localizedText,
  address: z.string().min(1),
  isActive: z.boolean(),
});
