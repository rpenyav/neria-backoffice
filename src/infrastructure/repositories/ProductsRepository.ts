import { ENDPOINTS } from "../api/endpoints";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  PagedResponse,
} from "../../domain/interfaces/Product";
import type { HttpClient } from "../api/httpClient";

export class ProductsRepository {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  listPaginated(
    page: number,
    pageSize: number
  ): Promise<PagedResponse<Product>> {
    const url = `${ENDPOINTS.products.base}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedResponse<Product>>(url);
  }

  getById(id: string): Promise<Product> {
    return this.http.get<Product>(ENDPOINTS.products.byId(id));
  }

  getBySlug(slug: string): Promise<Product> {
    return this.http.get<Product>(ENDPOINTS.products.bySlug(slug));
  }

  create(payload: CreateProductPayload): Promise<Product> {
    return this.http.post<Product>(ENDPOINTS.products.base, payload);
  }

  update(id: string, payload: UpdateProductPayload): Promise<Product> {
    return this.http.patch<Product>(ENDPOINTS.products.byId(id), payload);
  }

  delete(id: string): Promise<void> {
    return this.http.delete<void>(ENDPOINTS.products.byId(id));
  }
}
