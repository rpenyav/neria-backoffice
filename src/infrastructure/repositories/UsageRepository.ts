import { ENDPOINTS } from "../api/endpoints";
import type { HttpClient } from "../api/httpClient";
import type { Usage } from "../../domain/interfaces/Usage";
import type { PagedResponse } from "../../domain/interfaces/Product"; // reutilizamos el genérico

export class UsageRepository {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * GET /usage?page=1&pageSize=50
   * Devuelve el listado paginado de uso global.
   */
  listPaginated(page: number, pageSize: number): Promise<PagedResponse<Usage>> {
    const url = `${ENDPOINTS.usage.base}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedResponse<Usage>>(url);
  }

  /**
   * GET /usage/by-user/:userId?page=1&pageSize=50
   */
  listByUser(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResponse<Usage>> {
    const url = `${ENDPOINTS.usage.byUser(
      userId
    )}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedResponse<Usage>>(url);
  }

  /**
   * GET /usage/by-conversation/:conversationId?page=1&pageSize=50
   */
  listByConversation(
    conversationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResponse<Usage>> {
    const url = `${ENDPOINTS.usage.byConversation(
      conversationId
    )}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedResponse<Usage>>(url);
  }
}
