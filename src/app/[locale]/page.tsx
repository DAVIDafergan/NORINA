import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountStatus } from "@/components/auth/account-status";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <div className="flex w-full items-center justify-end gap-4 self-end">
        <AccountStatus />
        <LanguageSwitcher />
      </div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-zinc-500">{t("subtitle")}</p>
    </div>
  );
}
