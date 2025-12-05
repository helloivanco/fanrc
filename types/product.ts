export interface ProductOption {
  name: string;
  position: number;
  values: string[];
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
}

export interface Product {
  id: number;
  title: string;
  handle: string;
  url: string;
  description_html: string;
  description_text: string;
  images: string[];
  featured_image: string;
  vendor: string;
  product_type: string;
  tags: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  featured_image_local?: string;
  images_local?: string[];
}

export interface WishlistItem {
  productId: number;
  variantId?: number;
  quantity: number;
}

