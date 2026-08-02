import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { homepageSettingSchema } from "@/lib/admin/schemas";
import { decodeHeroMedia, HeroMediaValidationError } from "@/lib/admin/hero-media";

/** HomepageSetting is a singleton - always read/write the first row (see schema comment). */
export const PATCH = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = homepageSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { heroMediaType, heroEyebrow, heroHeadline, heroSubheadline, heroDesktopMedia, heroMobileMedia } = parsed.data;

  const existing = await prisma.homepageSetting.findFirst();

  if (!existing && !heroDesktopMedia) {
    return NextResponse.json({ error: "desktop_media_required" }, { status: 400 });
  }

  let decodedDesktop: { mimeType: string; buffer: Buffer } | undefined;
  let decodedMobile: { mimeType: string; buffer: Buffer } | undefined;
  try {
    if (heroDesktopMedia) decodedDesktop = decodeHeroMedia(heroDesktopMedia.dataUrl, heroMediaType);
    if (heroMediaType === "IMAGE" && heroMobileMedia) {
      decodedMobile = decodeHeroMedia(heroMobileMedia.dataUrl, "IMAGE");
    }
  } catch (error) {
    if (error instanceof HeroMediaValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const staleMediaIds: string[] = [];

  const result = await prisma.$transaction(async (tx) => {
    const newDesktop = decodedDesktop
      ? await tx.siteMedia.create({
          data: { mimeType: decodedDesktop.mimeType, data: new Uint8Array(decodedDesktop.buffer) },
        })
      : null;

    // Video hero has no separate mobile variant - clear any leftover image-mode mobile media.
    const clearingMobile = heroMediaType === "VIDEO" || heroMobileMedia === null;
    const newMobile =
      heroMediaType === "IMAGE" && decodedMobile
        ? await tx.siteMedia.create({
            data: { mimeType: decodedMobile.mimeType, data: new Uint8Array(decodedMobile.buffer) },
          })
        : null;

    const desktopMediaId = newDesktop?.id ?? existing?.heroDesktopMediaId ?? null;
    const mobileMediaId = newMobile?.id ?? (clearingMobile ? null : (existing?.heroMobileMediaId ?? null));

    if (newDesktop && existing?.heroDesktopMediaId) staleMediaIds.push(existing.heroDesktopMediaId);
    if (existing?.heroMobileMediaId && existing.heroMobileMediaId !== mobileMediaId) {
      staleMediaIds.push(existing.heroMobileMediaId);
    }

    const data = {
      heroMediaType,
      heroDesktopMediaId: desktopMediaId,
      heroMobileMediaId: mobileMediaId,
      heroEyebrow,
      heroHeadline,
      heroSubheadline,
    };

    const setting = existing
      ? await tx.homepageSetting.update({ where: { id: existing.id }, data })
      : await tx.homepageSetting.create({ data });

    if (staleMediaIds.length > 0) {
      await tx.siteMedia.deleteMany({ where: { id: { in: staleMediaIds } } });
    }

    return setting;
  });

  return NextResponse.json({ id: result.id });
});
