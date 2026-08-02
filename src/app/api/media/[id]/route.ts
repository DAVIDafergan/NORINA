import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public - streams a SiteMedia row's bytes (hero image/video) instead of inlining it as a data: URL. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const media = await prisma.siteMedia.findUnique({ where: { id }, select: { mimeType: true, data: true } });
  if (!media) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": media.data.length.toString(),
      // Content-addressed by id (a new upload always gets a new id), so this is safe to cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
