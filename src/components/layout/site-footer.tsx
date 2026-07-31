import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("common");
  return (
    <footer className="border-t border-gold/30 bg-cream py-8 text-center text-sm text-ink/60">
      &copy; {new Date().getFullYear()} {t("siteName")}
    </footer>
  );
}
