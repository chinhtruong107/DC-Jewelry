export interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  price: number;
  image: string;
  description?: string;
  description_en?: string | null;
  category?: string;
  isBestSeller?: boolean;
  is_best_seller?: boolean;
  stock?: number;
  status?: string;
  warranty_months?: number;
  recommendation_reason?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size?: string | null;
  length?: string | null;
  gold_type?: string | null;
  label?: string;
  price: number;
  stock: number;
  is_active: boolean;
  sort_order?: number;
}
