// src/application/context/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthService } from "../../domain/services/AuthService";
import type { LoginPayload } from "../../domain/interfaces/Auth";
import type { User } from "../../domain/interfaces/User";
import { createHttpClient } from "../../infrastructure/api/httpClient";
import { UsersService } from "../../domain/services/UsersService";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Nombre de la cookie donde guardaremos el token
const TOKEN_COOKIE = "neria_backoffice_token";

// Helpers para manejar la cookie del token
const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`));

  if (!raw) return null;
  const [, value] = raw.split("=");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const setTokenCookie = (token: string) => {
  if (typeof document === "undefined") return;

  // 7 días de expiración, ajusta si quieres
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; samesite=lax`;
  // Si quieres forzar secure solo en https:
  // if (window.location.protocol === "https:") {
  //   document.cookie += "; secure";
  // }
};

const clearTokenCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Hidratamos el token inicial desde cookie
  const [token, setToken] = useState<string | null>(() => getTokenFromCookie());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  // El HttpClient sigue igual, pero ahora el token viene del estado
  // (que a su vez se alimenta de la cookie).
  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => getTokenFromCookie(),
      }),
    []
  );

  const authService = useMemo(() => new AuthService(), []);
  const usersService = useMemo(
    () => new UsersService(httpClient),
    [httpClient]
  );

  const fetchMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const me = await usersService.getMe();
      setUser(me);
    } catch (error) {
      console.error("Error cargando usuario actual", error);
      // Si el token es inválido limpiamos todo y forzamos login
      setToken(null);
      clearTokenCookie();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token, usersService]);

  useEffect(() => {
    if (token) {
      void fetchMe();
    }
  }, [token, fetchMe]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const res = await authService.login(payload);

        // Ojo con el nombre de la propiedad: asegúrate que es 'access_token'
        // o 'accessToken' según devuelva el backend.
        const accessToken =
          (res as any).accessToken ?? (res as any).access_token;

        if (!accessToken) {
          throw new Error("No se ha recibido access token en la respuesta");
        }

        setToken(accessToken);
        setTokenCookie(accessToken);

        await fetchMe();
      } catch (error) {
        console.error("Error en login", error);
        setToken(null);
        clearTokenCookie();
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authService, fetchMe]
  );

  const logout = useCallback(() => {
    setToken(null);
    clearTokenCookie();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return ctx;
};
