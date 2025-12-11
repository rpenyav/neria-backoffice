import type { Category, PaginatedResponse } from "../interfaces/Category";
import { CategoriesRepository } from "../../infrastructure/repositories/CategoriesRepository";
import type { HttpClient } from "../../infrastructure/api/httpClient";

export class CategoriesService {
  private repo: CategoriesRepository;

  constructor(httpClient: HttpClient) {
    this.repo = new CategoriesRepository(httpClient);
  }

  getPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<Category>> {
    return this.repo.listPaginated(page, pageSize);
  }

  getById(id: number | string): Promise<Category> {
    return this.repo.getById(id);
  }

  // Métodos extra (create/update/delete) si los necesitas en el backoffice:
  create(category: Omit<Category, "id">): Promise<Category> {
    return this.repo.create(category);
  }

  update(
    id: number | string,
    payload: Partial<Omit<Category, "id">>
  ): Promise<Category> {
    return this.repo.update(id, payload);
  }

  delete(id: number | string): Promise<void> {
    return this.repo.delete(id);
  }
}
