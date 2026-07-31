/*
  Warnings:

  - You are about to drop the column `shippingCity` on the `Order` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingCity",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pickupLocationId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "PickupLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
