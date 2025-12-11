import { ENDPOINTS } from "../api/endpoints";
import type {
  LoginPayload,
  LoginResponse,
  AnonymousSessionResponse,
} from "../../domain/interfaces/Auth";

export class AuthRepository {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(ENDPOINTS.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Credenciales incorrectas");
    }

    return res.json() as Promise<LoginResponse>;
  }

  async createAnonymousSession(): Promise<AnonymousSessionResponse> {
    const res = await fetch(ENDPOINTS.auth.anonymousSession, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("No se pudo crear la sesión anónima");
    }

    return res.json() as Promise<AnonymousSessionResponse>;
  }
}
