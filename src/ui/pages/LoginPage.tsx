import React, { useState, type FormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/application/context/AuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas o error de servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
          padding: "2rem",
        }}
      >
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.5rem" }}>
          Neria Backoffice
        </h1>
        <p
          style={{
            marginTop: 0,
            marginBottom: "1.5rem",
            color: "#6b7280",
            fontSize: "0.9rem",
          }}
        >
          Inicia sesión para gestionar usuarios, productos y monitorización.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem",
              borderRadius: 999,
              border: "none",
              background: loading ? "#94a3b8" : "#1d4ed8",
              color: "#ffffff",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              fontSize: "0.95rem",
              transition: "background 0.15s ease-in-out",
            }}
          >
            {loading ? "Accediendo..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};
