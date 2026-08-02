import { parseDataUrl } from "@/lib/data-url";

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/webp"]);
const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export class HeroMediaValidationError extends Error {}

/** Decodes + validates a hero media upload against the limits for its kind. Throws HeroMediaValidationError with a machine-readable code on failure. */
export function decodeHeroMedia(dataUrl: string, kind: "IMAGE" | "VIDEO"): { mimeType: string; buffer: Buffer } {
  const decoded = parseDataUrl(dataUrl);
  if (!decoded) throw new HeroMediaValidationError("invalid_media");
  const { mimeType, buffer } = decoded;

  if (kind === "IMAGE") {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) throw new HeroMediaValidationError("invalid_image_type");
    if (buffer.byteLength > MAX_IMAGE_BYTES) throw new HeroMediaValidationError("image_too_large");
  } else {
    if (!ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) throw new HeroMediaValidationError("invalid_video_type");
    if (buffer.byteLength > MAX_VIDEO_BYTES) throw new HeroMediaValidationError("video_too_large");
  }

  return { mimeType, buffer };
}
