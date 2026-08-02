import { prisma } from "@/lib/prisma";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { PickupLocationsManager } from "@/components/admin/pickup-locations-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { LocalizedText } from "@/lib/types";

export default async function AdminShippingPage() {
  const [setting, locations] = await Promise.all([
    prisma.shippingSetting.findFirst(),
    prisma.pickupLocation.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader title="הגדרות משלוח" />

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-soft">עלות ותנאי משלוח</h2>
        <ShippingSettingsForm
          flatRatePrice={setting ? Number(setting.flatRatePrice) : 0}
          freeShippingAbove={setting?.freeShippingAbove ? Number(setting.freeShippingAbove) : null}
        />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-soft">נקודות איסוף עצמי</h2>
        <PickupLocationsManager
          locations={locations.map((location) => ({
            id: location.id,
            cityName: location.cityName as LocalizedText,
            address: location.address,
            isActive: location.isActive,
          }))}
        />
      </div>
    </div>
  );
}
