import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { WizardStepper } from "@/components/admin/wizard-stepper";
import { NewProductStep } from "@/components/admin/new-product-step";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AdminPageHeader
          title="מוצר חדש"
          description="קודם נשמור את הפרטים הבסיסיים - בשלב הבא נוסיף צבעים ותמונות, ואז מידות ומלאי."
        />
        <div className="mt-6">
          <WizardStepper current={1} />
        </div>
      </div>
      <NewProductStep categories={categories.map((c) => ({ id: c.id, name: getLocalizedText(c.name, "he") }))} />
    </div>
  );
}
