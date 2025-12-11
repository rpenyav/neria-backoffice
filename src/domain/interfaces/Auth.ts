export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  // añade aquí refreshToken / expiresIn si el backend lo devuelve
}

export interface AnonymousSessionResponse {
  sessionId: string;
  // lo que tengas realmente en backend
}
