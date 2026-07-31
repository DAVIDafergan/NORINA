/**
 * Local/dev-only seed data so the storefront has something to render.
 * Images are generic placeholder photos (picsum.photos) - swap for real
 * product photography via the admin panel (stage 7) once storage is wired up.
 */
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sizes = await Promise.all(
    [
      { label: "XS", orderIndex: 0 },
      { label: "S", orderIndex: 1 },
      { label: "M", orderIndex: 2 },
      { label: "L", orderIndex: 3 },
      { label: "XL", orderIndex: 4 },
    ].map((size) =>
      prisma.size.upsert({ where: { label: size.label }, update: {}, create: size }),
    ),
  );

  const dresses = await prisma.category.upsert({
    where: { slug: "dresses" },
    update: {},
    create: {
      slug: "dresses",
      name: { he: "שמלות", fr: "Robes", en: "Dresses" },
    },
  });

  const coats = await prisma.category.upsert({
    where: { slug: "coats" },
    update: {},
    create: {
      slug: "coats",
      name: { he: "מעילים", fr: "Manteaux", en: "Coats" },
    },
  });

  const products = [
    {
      slug: "camille-silk-dress",
      name: { he: "שמלת משי קמיל", fr: "Robe en soie Camille", en: "Camille Silk Dress" },
      description: {
        he: "שמלת משי יוקרתית בגזרה נשית, מתאימה לערב.",
        fr: "Robe en soie luxueuse à la coupe féminine, idéale pour le soir.",
        en: "A luxurious silk dress with a feminine cut, perfect for evening wear.",
      },
      categoryId: dresses.id,
      basePrice: "890.00",
      colors: [
        { name: { he: "שמנת", fr: "Crème", en: "Cream" }, hexCode: "#F1E9DC", seed: "camille-cream" },
        { name: { he: "שחור", fr: "Noir", en: "Black" }, hexCode: "#1C1C1C", seed: "camille-black" },
      ],
    },
    {
      slug: "rosalie-wool-coat",
      name: { he: "מעיל צמר רוזלי", fr: "Manteau en laine Rosalie", en: "Rosalie Wool Coat" },
      description: {
        he: "מעיל צמר איכותי עם גימור אלגנטי לחורף.",
        fr: "Manteau en laine de qualité avec une finition élégante pour l'hiver.",
        en: "A quality wool coat with an elegant finish for winter.",
      },
      categoryId: coats.id,
      basePrice: "1290.00",
      colors: [
        { name: { he: "בז'", fr: "Beige", en: "Beige" }, hexCode: "#D9C7A8", seed: "rosalie-beige" },
        { name: { he: "רוזה", fr: "Rose", en: "Blush" }, hexCode: "#E3C4C0", seed: "rosalie-blush" },
      ],
    },
    {
      slug: "adele-midi-dress",
      name: { he: "שמלת מידי אדל", fr: "Robe midi Adèle", en: "Adele Midi Dress" },
      description: {
        he: "שמלת מידי יומיומית עם קו נקי ומחמיא.",
        fr: "Robe midi du quotidien à la ligne épurée et flatteuse.",
        en: "An everyday midi dress with a clean, flattering line.",
      },
      categoryId: dresses.id,
      basePrice: "650.00",
      colors: [
        { name: { he: "זהב", fr: "Or", en: "Gold" }, hexCode: "#C9A24B", seed: "adele-gold" },
      ],
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        basePrice: product.basePrice,
      },
    });

    for (const colorDef of product.colors) {
      const color = await prisma.color.create({
        data: {
          productId: created.id,
          name: colorDef.name,
          hexCode: colorDef.hexCode,
          images: {
            create: [
              { url: `https://picsum.photos/seed/${colorDef.seed}-1/800/1000`, order: 0 },
              { url: `https://picsum.photos/seed/${colorDef.seed}-2/800/1000`, order: 1 },
            ],
          },
        },
      });

      for (const size of sizes.slice(1, 4)) {
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            colorId: color.id,
            sizeId: size.id,
            sku: `${product.slug}-${colorDef.seed}-${size.label}`,
            stockQuantity: size.label === "M" ? 2 : 8,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
