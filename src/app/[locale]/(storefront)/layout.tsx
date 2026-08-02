import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { IntroAnimation } from "@/components/intro/intro-animation";
import { ToastHost } from "@/components/ui/toast-host";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroAnimation />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ToastHost />
    </>
  );
}
