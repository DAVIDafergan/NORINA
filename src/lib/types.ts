export type Locale = "he" | "fr" | "en";

/** Shape stored in every Prisma `Json` i18n field (Product.name, Category.name, ...). */
export type LocalizedText = Record<Locale, string>;
