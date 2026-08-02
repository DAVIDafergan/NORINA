import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDataUrl } from "@/lib/data-url";

/**
 * Public. ColorImage.url is a base64 data: URL (see schema comment) - crawlers
 * that generate link previews (WhatsApp, Facebook, ...) fetch og:image as a
 * plain HTTP URL and can't resolve a data: URI, so this route decodes and
 * streams the bytes instead. Falls back to a redirect for the (rare) case
 * where url is already a plain http(s) URL rather than a data: URL.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await prisma.colorImage.findUnique({ where: { id }, select: { url: true } });
  if (!image) return new NextResponse(null, { status: 404 });

  const decoded = parseDataUrl(image.url);
  if (!decoded) return NextResponse.redirect(image.url);

  return new NextResponse(new Uint8Array(decoded.buffer), {
    headers: {
      "Content-Type": decoded.mimeType,
      "Content-Length": decoded.buffer.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
