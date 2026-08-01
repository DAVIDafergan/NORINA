// Client-side only. Resizes/compresses an uploaded image before it's sent to
// the server as a data: URL - see prisma/schema.prisma ColorImage.url comment
// for why images are embedded in Postgres instead of object storage for now.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unsupported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
