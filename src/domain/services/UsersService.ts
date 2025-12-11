// src/domain/services/UsersService.ts
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  PagedUsersResponse,
} from "../interfaces/User";
import type { HttpClient } from "../../infrastructure/api/httpClient";
import { UsersRepository } from "../../infrastructure/repositories/UsersRepository";

export class UsersService {
  private repo: UsersRepository;

  constructor(httpClient: HttpClient) {
    this.repo = new UsersRepository(httpClient);
  }

  // --- Listado ---

  listUsers(): Promise<User[]> {
    return this.repo.list();
  }

  listUsersPaginated(
    page: number,
    pageSize: number
  ): Promise<PagedUsersResponse> {
    return this.repo.listPaginated(page, pageSize);
  }

  // --- Lectura individual ---

  getUser(id: string): Promise<User> {
    return this.repo.getById(id);
  }

  getMe(): Promise<User> {
    return this.repo.getMeInfo();
  }

  // --- Crear / actualizar / borrar ---

  createUser(payload: CreateUserPayload): Promise<User> {
    return this.repo.create(payload);
  }

  /**
   * Actualizar "mi usuario" (PATCH /users).
   * Si ya lo usas en otra parte, sigue funcionando.
   */
  updateMe(payload: UpdateUserPayload): Promise<User> {
    return this.repo.updateMe(payload);
  }

  /**
   * Actualizar un usuario concreto por id (PATCH /users/:id),
   * pensado para el backoffice.
   */
  updateUserById(id: string, payload: UpdateUserPayload): Promise<User> {
    return this.repo.updateById(id, payload);
  }

  deleteUser(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
