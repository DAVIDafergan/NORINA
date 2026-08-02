-- CreateEnum
CREATE TYPE "HeroMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "SiteMedia" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSetting" (
    "id" TEXT NOT NULL,
    "heroMediaType" "HeroMediaType" NOT NULL DEFAULT 'IMAGE',
    "heroDesktopMediaId" TEXT,
    "heroMobileMediaId" TEXT,
    "heroEyebrow" JSONB NOT NULL,
    "heroHeadline" JSONB NOT NULL,
    "heroSubheadline" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSetting_heroDesktopMediaId_key" ON "HomepageSetting"("heroDesktopMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSetting_heroMobileMediaId_key" ON "HomepageSetting"("heroMobileMediaId");

-- AddForeignKey
ALTER TABLE "HomepageSetting" ADD CONSTRAINT "HomepageSetting_heroDesktopMediaId_fkey" FOREIGN KEY ("heroDesktopMediaId") REFERENCES "SiteMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSetting" ADD CONSTRAINT "HomepageSetting_heroMobileMediaId_fkey" FOREIGN KEY ("heroMobileMediaId") REFERENCES "SiteMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
