// src/domain/interfaces/Product.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  price?: number | null;
  mileage?: number | null;
  fuelType?: string | null;
  gearbox?: string | null;
  seats?: number | null;
  doors?: number | null;
  color?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  active: boolean;
}

export interface PagedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalRegisters: number;
  list: T[];
}

export interface CreateProductPayload {
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  vehicleCategoryId?: number;
  fuelType?: string;
  gearbox?: string;
  seats?: number;
  doors?: number;
  color?: string;
  imageUrl?: string;
  description?: string;
  active?: boolean;
  productLink?: string;
  images?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}
