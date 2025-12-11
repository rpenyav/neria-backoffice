// src/infrastructure/api/httpClient.ts
const API_KEY = import.meta.env.VITE_API_KEY;

export interface HttpClientConfig {
  getToken: () => string | null;
}

/**
 * Solo tipo, sin valor en runtime.
 * Esto sí es compatible con `import type` + `erasableSyntaxOnly`.
 */
export interface HttpClient {
  get<T>(url: string, extraHeaders?: HeadersInit): Promise<T>;
  post<T>(url: string, body: unknown, extraHeaders?: HeadersInit): Promise<T>;
  patch<T>(url: string, body: unknown, extraHeaders?: HeadersInit): Promise<T>;
  delete<T = void>(url: string, extraHeaders?: HeadersInit): Promise<T>;
  uploadFormData<T>(url: string, formData: FormData): Promise<T>;
}

/**
 * Implementación interna del cliente HTTP.
 * No se exporta el nombre de la clase, solo la factory.
 */
class HttpClientImpl implements HttpClient {
  private readonly getToken: () => string | null;

  constructor(config: HttpClientConfig) {
    this.getToken = config.getToken;
  }

  private buildHeaders(extra?: HeadersInit): HeadersInit {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (extra) {
      Object.assign(headers, extra as Record<string, string>);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (API_KEY) {
      headers["x-api-key"] = API_KEY as string;
    }

    return headers;
  }

  async get<T>(url: string, extraHeaders?: HeadersInit): Promise<T> {
    const res = await fetch(url, {
      method: "GET",
      headers: this.buildHeaders(extraHeaders),
    });

    if (!res.ok) {
      throw new Error(`GET ${url} failed with ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async post<T>(
    url: string,
    body: unknown,
    extraHeaders?: HeadersInit
  ): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(extraHeaders),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST ${url} failed with ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async patch<T>(
    url: string,
    body: unknown,
    extraHeaders?: HeadersInit
  ): Promise<T> {
    const res = await fetch(url, {
      method: "PATCH",
      headers: this.buildHeaders(extraHeaders),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`PATCH ${url} failed with ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async delete<T = void>(url: string, extraHeaders?: HeadersInit): Promise<T> {
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.buildHeaders(extraHeaders),
    });

    if (!res.ok) {
      throw new Error(`DELETE ${url} failed with ${res.status}`);
    }

    // 204 No Content → devolvemos undefined
    if (res.status === 204) {
      return undefined as T;
    }

    // Puede que el backend responda 200 sin cuerpo → hay que comprobar
    const text = await res.text();

    if (!text) {
      // Sin cuerpo → interpretamos como "void"
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Si por lo que sea el cuerpo no es JSON válido, tampoco reventamos
      return undefined as T;
    }
  }

  async uploadFormData<T>(url: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (API_KEY) {
      headers["x-api-key"] = API_KEY as string;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`UPLOAD ${url} failed with ${res.status}`);
    }

    return res.json() as Promise<T>;
  }
}

/**
 * Factory que crea instancias de HttpClient.
 * Esto es lo que usarás en runtime.
 */
export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  return new HttpClientImpl(config);
};
