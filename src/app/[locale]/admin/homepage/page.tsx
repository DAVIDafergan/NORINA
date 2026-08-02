import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageHeroForm } from "@/components/admin/homepage-hero-form";
import type { LocalizedText, Locale } from "@/lib/types";

const LOCALES: Locale[] = ["he", "fr", "en"];

async function defaultLocalizedText(key: "heroEyebrow" | "heroHeadline" | "heroSubheadline"): Promise<LocalizedText> {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "home" });
      return [locale, t(key)] as const;
    }),
  );
  return Object.fromEntries(entries) as LocalizedText;
}

export default async function AdminHomepagePage() {
  const setting = await prisma.homepageSetting.findFirst();

  const initial = {
    heroMediaType: setting?.heroMediaType ?? ("IMAGE" as const),
    heroDesktopMediaId: setting?.heroDesktopMediaId ?? null,
    heroMobileMediaId: setting?.heroMobileMediaId ?? null,
    heroEyebrow: (setting?.heroEyebrow as LocalizedText | undefined) ?? (await defaultLocalizedText("heroEyebrow")),
    heroHeadline: (setting?.heroHeadline as LocalizedText | undefined) ?? (await defaultLocalizedText("heroHeadline")),
    heroSubheadline:
      (setting?.heroSubheadline as LocalizedText | undefined) ?? (await defaultLocalizedText("heroSubheadline")),
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="עיצוב דף הבית"
        description="קובעת את התמונה/סרטון הרקע ואת הטקסט של ה-Hero הראשי בדף הבית."
      />
      <HomepageHeroForm initial={initial} />
    </div>
  );
}
