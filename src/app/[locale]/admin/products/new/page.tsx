import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { WizardStepper } from "@/components/admin/wizard-stepper";
import { NewProductStep } from "@/components/admin/new-product-step";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">מוצר חדש</h1>
        <WizardStepper current={1} />
      </div>
      <p className="max-w-xl text-sm text-ink-soft">
        קודם נשמור את הפרטים הבסיסיים - בשלב הבא נוסיף צבעים ותמונות, ואז מידות ומלאי.
      </p>
      <NewProductStep categories={categories.map((c) => ({ id: c.id, name: getLocalizedText(c.name, "he") }))} />
    </div>
  );
}
