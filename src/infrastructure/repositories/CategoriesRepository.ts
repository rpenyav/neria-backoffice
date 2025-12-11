import { ENDPOINTS } from "../api/endpoints";
import type { HttpClient } from "../api/httpClient";
import type {
  Category,
  PaginatedResponse,
} from "../../domain/interfaces/Category";

export class CategoriesRepository {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  listPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<Category>> {
    const url = ENDPOINTS.categories.paginated(page, pageSize);
    return this.http.get<PaginatedResponse<Category>>(url);
  }

  getById(id: number | string): Promise<Category> {
    return this.http.get<Category>(ENDPOINTS.categories.byId(id));
  }

  create(category: Omit<Category, "id">): Promise<Category> {
    return this.http.post<Category>(ENDPOINTS.categories.base, category);
  }

  update(
    id: number | string,
    payload: Partial<Omit<Category, "id">>
  ): Promise<Category> {
    return this.http.patch<Category>(ENDPOINTS.categories.byId(id), payload);
  }

  delete(id: number | string): Promise<void> {
    return this.http.delete<void>(ENDPOINTS.categories.byId(id));
  }
}
