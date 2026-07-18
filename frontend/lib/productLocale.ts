import type { Language } from "@/lib/i18n";
import type { Product, ProductVariant } from "@/types/product";

export function productName(product: Pick<Product, "name" | "name_en">, language: Language) {
  return language === "en" && product.name_en?.trim() ? product.name_en : product.name;
}

export function productDescription(product: Pick<Product, "description" | "description_en">, language: Language) {
  return language === "en" && product.description_en?.trim() ? product.description_en : product.description;
}

export function variantLabel(variant: ProductVariant, language: Language) {
  const values = [variant.gold_type, variant.size, variant.length].filter(Boolean) as string[];

  if (language === "vi") return values.join(" · ") || variant.sku;

  return values
    .map((value) => localizedVariantSnapshot(value, language))
    .join(" · ") || variant.sku;
}

export function localizedVariantSnapshot(value: string, language: Language) {
  if (language === "vi") return value;

  return value
    .replace("Vàng trắng", "White gold")
    .replace("Vàng hồng", "Rose gold")
    .replace("Vàng vàng", "Yellow gold")
    .replace("Nhỏ", "Small")
    .replace("Vừa", "Medium")
    .replace("Lớn", "Large");
}
