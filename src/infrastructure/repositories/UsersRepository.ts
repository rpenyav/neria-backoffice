// src/infrastructure/repositories/UsersRepository.ts
import { ENDPOINTS } from "../api/endpoints";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  PagedUsersResponse,
} from "../../domain/interfaces/User";
import type { HttpClient } from "../api/httpClient";

export class UsersRepository {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Listado SIN paginar (si el backend lo soporta).
   * Lo dejo por compatibilidad, pero en el backoffice usaremos listPaginated.
   */
  list(): Promise<User[]> {
    return this.http.get<User[]>(ENDPOINTS.users.base);
  }

  /**
   * Listado paginado /users?page=&pageSize=
   */
  listPaginated(page: number, pageSize: number): Promise<PagedUsersResponse> {
    const url = `${ENDPOINTS.users.base}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedUsersResponse>(url);
  }

  getById(id: string): Promise<User> {
    return this.http.get<User>(ENDPOINTS.users.byId(id));
  }

  getMeInfo(): Promise<User> {
    return this.http.get<User>(ENDPOINTS.users.meInfo);
  }

  create(payload: CreateUserPayload): Promise<User> {
    return this.http.post<User>(ENDPOINTS.users.base, payload);
  }

  /**
   * Actualizar "mi usuario" (PATCH /users).
   * Lo dejo por si ya lo usas en otra parte.
   */
  updateMe(payload: UpdateUserPayload): Promise<User> {
    return this.http.patch<User>(ENDPOINTS.users.base, payload);
  }

  /**
   * Actualizar un usuario concreto (PATCH /users/:id),
   * para el backoffice.
   */
  updateById(id: string, payload: UpdateUserPayload): Promise<User> {
    return this.http.patch<User>(ENDPOINTS.users.byId(id), payload);
  }

  delete(id: string): Promise<void> {
    return this.http.delete<void>(ENDPOINTS.users.byId(id));
  }
}
