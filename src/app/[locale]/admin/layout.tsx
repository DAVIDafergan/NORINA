import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  // Admin UI is Hebrew-only for now (spec section 4.6) - keep it simple rather
  // than translating the whole back office; revisit if multi-lingual admin is needed.
  if (locale !== "he") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-10">{children}</main>
    </div>
  );
}
