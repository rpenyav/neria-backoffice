export interface Category {
  id: number;
  slug: string;
  code: string;
  name: string;
  description?: string | null;
}

// Si ya tienes este tipo genérico en otro sitio, reutilízalo.
// Si no, puedes usar este:
export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalRegisters: number;
  list: T[];
}
