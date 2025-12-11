import type { LoginPayload, LoginResponse } from "../interfaces/Auth";
import { AuthRepository } from "../../infrastructure/repositories/AuthRepository";

export class AuthService {
  private repo = new AuthRepository();

  login(payload: LoginPayload): Promise<LoginResponse> {
    return this.repo.login(payload);
  }

  createAnonymousSession() {
    return this.repo.createAnonymousSession();
  }
}
