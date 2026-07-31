"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AccountStatus() {
  const { data: session, status } = useSession();
  const t = useTranslations("auth");
  const tSignIn = useTranslations("auth.signIn");

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link href="/sign-in" className="text-sm font-medium hover:underline">
        {tSignIn("title")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{session.user?.name ?? session.user?.email}</span>
      <Button variant="secondary" onClick={() => signOut()}>
        {t("signOut")}
      </Button>
    </div>
  );
}
