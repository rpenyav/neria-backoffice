import type { HttpClient } from "../../infrastructure/api/httpClient";
import { ProductsRepository } from "../../infrastructure/repositories/ProductsRepository";
import type {
  Product,
  PagedResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from "../interfaces/Product";

export class ProductsService {
  private readonly repo: ProductsRepository;

  constructor(http: HttpClient) {
    this.repo = new ProductsRepository(http);
  }

  listPaginated(
    page: number,
    pageSize: number
  ): Promise<PagedResponse<Product>> {
    return this.repo.listPaginated(page, pageSize);
  }

  getById(id: string): Promise<Product> {
    return this.repo.getById(id);
  }

  create(payload: CreateProductPayload): Promise<Product> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateProductPayload): Promise<Product> {
    return this.repo.update(id, payload);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
