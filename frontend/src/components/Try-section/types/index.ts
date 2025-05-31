export type ImageSide = "Middle" | "Left" | "Right";

export interface Product {
  product_url: string;
  price?: number;
  rating?: number;
  reviews_count?: number;
  image_url?: string;
  title?: string;
}

export interface Category {
  category: string;
  products: Product[];
}
