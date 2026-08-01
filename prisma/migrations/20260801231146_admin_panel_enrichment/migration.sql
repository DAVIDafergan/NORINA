-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ColorImage" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "additionalInfo" JSONB,
ADD COLUMN     "careInstructions" JSONB,
ADD COLUMN     "materials" JSONB;
