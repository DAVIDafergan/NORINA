"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

interface CategoryOption {
  id: string;
  name: string;
}

export function NewProductStep({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();

  return (
    <ProductForm
      categories={categories}
      submitLabel="הבא: צבעים ותמונות ←"
      onCreated={(id) => router.push(`/admin/products/${id}?wizard=2`)}
    />
  );
}
