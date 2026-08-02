"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/icons";

export function AccountStatus({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  const t = useTranslations("auth");
  const tSignIn = useTranslations("auth.signIn");

  if (status === "loading") return null;

  if (!session) {
    if (compact) {
      return (
        <Link
          href="/sign-in"
          aria-label={tSignIn("title")}
          className="flex h-10 w-10 items-center justify-center text-ink/80 transition-colors hover:text-gold"
        >
          <UserIcon className="h-5 w-5" />
        </Link>
      );
    }
    return (
      <Link href="/sign-in" className="text-sm font-medium hover:underline">
        {tSignIn("title")}
      </Link>
    );
  }

  if (compact) {
    return (
      <div className="group relative flex items-center">
        <button
          type="button"
          aria-label={session.user?.name ?? session.user?.email ?? ""}
          className="flex h-10 w-10 items-center justify-center text-ink/80 transition-colors hover:text-gold"
        >
          <UserIcon className="h-5 w-5" />
        </button>
        <div className="invisible absolute end-0 top-full z-30 mt-1 min-w-40 rounded-sm border border-line bg-cream p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <p className="truncate px-1 pb-2 text-sm text-ink/80">{session.user?.name ?? session.user?.email}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-sm px-1 py-1.5 text-start text-sm text-ink/70 transition-colors hover:bg-cream-deep hover:text-gold"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
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
