import { prisma } from "@/lib/prisma";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { PickupLocationsManager } from "@/components/admin/pickup-locations-manager";
import type { LocalizedText } from "@/lib/types";

export default async function AdminShippingPage() {
  const [setting, locations] = await Promise.all([
    prisma.shippingSetting.findFirst(),
    prisma.pickupLocation.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">הגדרות משלוח</h1>
        <ShippingSettingsForm
          flatRatePrice={setting ? Number(setting.flatRatePrice) : 0}
          freeShippingAbove={setting?.freeShippingAbove ? Number(setting.freeShippingAbove) : null}
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">נקודות איסוף עצמי</h2>
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
