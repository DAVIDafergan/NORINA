import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("common");
  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
      &copy; {new Date().getFullYear()} {t("siteName")}
    </footer>
  );
}
