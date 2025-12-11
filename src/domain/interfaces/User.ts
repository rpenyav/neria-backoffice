// src/domain/interfaces/User.ts

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  name?: string;
}

/**
 * Respuesta paginada del endpoint /users
 */
export interface PagedUsersResponse {
  pageSize: number;
  pageNumber: number;
  totalRegisters: number;
  list: User[];
}
