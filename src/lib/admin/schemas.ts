import { z } from "zod";

const localizedText = z.object({ he: z.string().min(1), fr: z.string(), en: z.string() });
// Same shape, but "he" isn't required - used for the optional catalog-copy fields
// (materials/care/notes) that older products don't have at all.
const localizedTextOptional = z.object({ he: z.string(), fr: z.string(), en: z.string() });

// Images are base64 data: URLs stored directly in Postgres (no object storage
// provider yet - see DECISIONS.md), but a plain http(s) URL is still accepted so
// existing/seed data and any future migration to real storage keep working.
const MAX_IMAGE_URL_LENGTH = 6_000_000; // ~4.3MB raw image after base64 overhead
const colorImageSchema = z.object({
  url: z
    .string()
    .min(1)
    .max(MAX_IMAGE_URL_LENGTH, "image_too_large")
    .refine((v) => v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://"), "invalid_image"),
  isPrimary: z.boolean(),
});

export const productInputSchema = z.object({
  name: localizedText,
  description: localizedText,
  materials: localizedTextOptional.optional(),
  careInstructions: localizedTextOptional.optional(),
  additionalInfo: localizedTextOptional.optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().positive(),
  isActive: z.boolean(),
});

export const colorInputSchema = z.object({
  name: localizedText,
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  images: z.array(colorImageSchema).min(1, "color_needs_at_least_one_image"),
});

export const colorReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

// No ASCII-only regex here on purpose: slugs fall back to the Hebrew name
// (see slugify() in category-manager.tsx / src/lib/slugify.ts) when no
// English name is filled in, same convention as product slugs.
export const categoryInputSchema = z.object({
  slug: z.string().min(1),
  name: localizedText,
});

export const categoryReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
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

const cmMeasurement = z.number().int().positive().max(300).nullable().optional();

const sizeFields = z.object({
  label: z.string().min(1),
  bustMin: cmMeasurement,
  bustMax: cmMeasurement,
  waistMin: cmMeasurement,
  waistMax: cmMeasurement,
  hipsMin: cmMeasurement,
  hipsMax: cmMeasurement,
});

function rangeIsValid(min: number | null | undefined, max: number | null | undefined) {
  return !min || !max || min <= max;
}

// Create requires all 6 measurement fields to be internally consistent (min <= max);
// update (sizeUpdateSchema below) is a plain .partial() without this cross-check since
// the admin UI always submits the full row together, so it's redundant there.
export const sizeInputSchema = sizeFields.refine(
  (v) => rangeIsValid(v.bustMin, v.bustMax) && rangeIsValid(v.waistMin, v.waistMax) && rangeIsValid(v.hipsMin, v.hipsMax),
  { message: "measurement_range_invalid" },
);

export const sizeUpdateSchema = sizeFields.partial();

export const sizeReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});
