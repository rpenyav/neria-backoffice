// src/adapters/ui/react/layout/MainLayout.tsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/application/context/AuthContext";
import IconExit from "../components/icons/IconClip";

const headerLinkBase: React.CSSProperties = {
  display: "block",
  padding: "0.45rem 0.9rem",
  borderRadius: 999,
  textDecoration: "none",
  fontSize: "0.85rem",
  color: "#4b5563",
};

const headerLinkActive: React.CSSProperties = {
  ...headerLinkBase,
  background: "rgba(37, 99, 235, 0.08)",
  color: "#1d4ed8",
};

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        background: "#f4f4f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* SIDEBAR (solo usuario + logout) */}
      <aside
        style={{
          background:
            "radial-gradient(circle at top left, #0f172a, #020617 65%)",
          color: "#e5e7eb",
          padding: "0.75rem 0.4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-end",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            padding: "0.6rem 0.5rem",
            borderRadius: 12,
            background: "rgba(15, 23, 42, 0.85)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              wordBreak: "break-word",
            }}
          >
            {user?.name ?? user?.email ?? "Usuario autenticado"}
          </div> */}
          {/* <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
            Sesión activa
          </div> */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginTop: "0.3rem",
              alignSelf: "flex-start",
              padding: "0.25rem 0.6rem",
              borderRadius: 999,
              border: "0px solid #4b5563",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "0.7rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <IconExit size={24} color="#e5e7eb" />
          </button>
        </div>
      </aside>

      {/* COLUMNA DERECHA: HEADER + MAIN */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* HEADER con título + menú */}
        <header
          style={{
            background: "#ffffff",
            borderRadius: 0,
            padding: "0.75rem 1.5rem",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              Panel de inteligencia asistencial
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Gestión centralizada de chatbot, productos y monitorización.
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <NavLink
              to="/"
              end
              style={({ isActive }) =>
                isActive ? headerLinkActive : headerLinkBase
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/users"
              style={({ isActive }) =>
                isActive ? headerLinkActive : headerLinkBase
              }
            >
              Usuarios
            </NavLink>

            <NavLink
              to="/categories"
              style={({ isActive }) =>
                isActive ? headerLinkActive : headerLinkBase
              }
            >
              Categorías
            </NavLink>

            <NavLink
              to="/products"
              style={({ isActive }) =>
                isActive ? headerLinkActive : headerLinkBase
              }
            >
              Productos
            </NavLink>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            padding: "1.25rem 1.5rem",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
