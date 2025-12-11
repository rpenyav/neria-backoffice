// src/ui/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";

import { useAuthContext } from "@/application/context/AuthContext";
import { createHttpClient } from "@/infrastructure/api/httpClient";
import { UsageRepository } from "@/infrastructure/repositories/UsageRepository";
import { UsersService } from "@/domain/services/UsersService";
import type { Usage } from "@/domain/interfaces/Usage";
import type { PagedResponse } from "@/domain/interfaces/Product";
import { BreadcrumbComponent } from "../components/BreadcrumbComponent";
import { TableComponent } from "../components/TableComponent";

const PAGE_SIZE = 10;

export const DashboardPage: React.FC = () => {
  const { token } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usagePage, setUsagePage] = useState<PagedResponse<Usage> | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // cache userId -> nombre
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // HttpClient con el token del contexto
  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => token,
      }),
    [token]
  );

  const usageRepository = useMemo(
    () => new UsageRepository(httpClient),
    [httpClient]
  );

  const usersService = useMemo(
    () => new UsersService(httpClient),
    [httpClient]
  );

  const fetchUsage = useCallback(
    async (pageToLoad: number) => {
      if (!token) {
        setLoading(false);
        setError("No hay token de sesión. Inicia sesión de nuevo.");
        setUsagePage(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const page = await usageRepository.listPaginated(pageToLoad, PAGE_SIZE);
        setUsagePage(page);
      } catch (err) {
        console.error("Error cargando usage:", err);
        setError("No se ha podido cargar el usage global.");
        setUsagePage(null);
      } finally {
        setLoading(false);
      }
    },
    [token, usageRepository]
  );

  useEffect(() => {
    void fetchUsage(currentPage);
  }, [currentPage, fetchUsage]);

  // Cuando tengamos una página de usage, resolvemos los userId a nombres
  useEffect(() => {
    if (!usagePage) return;

    const idsToFetch = Array.from(
      new Set(
        usagePage.list
          .map((u) => u.userId)
          .filter((id): id is string => !!id && !(id in userNames))
      )
    );

    if (idsToFetch.length === 0) return;
    if (!token) return;

    const loadUsers = async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const user = await usersService.getUser(id);
              const name = user.name || user.email || id;
              return { id, name };
            } catch (e) {
              console.warn("No se ha podido cargar usuario", id, e);
              return { id, name: id }; // fallback: mostramos el id
            }
          })
        );

        setUserNames((prev) => {
          const next = { ...prev };
          for (const r of results) {
            next[r.id] = r.name;
          }
          return next;
        });
      } catch (e) {
        console.error("Error precargando nombres de usuarios", e);
      }
    };

    void loadUsers();
  }, [usagePage, usersService, userNames, token]);

  // Cálculo de KPIs a partir de usagePage (sobre la página actual)
  const kpis = useMemo(() => {
    if (!usagePage) {
      return {
        totalTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCalls: 0,
        uniqueUsers: 0,
        uniqueConversations: 0,
      };
    }

    const list = usagePage.list;

    let totalTokens = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const users = new Set<string>();
    const conversations = new Set<string>();

    list.forEach((u) => {
      const tt = u.totalTokens ?? 0;
      const it = u.inputTokens ?? 0;
      const ot = u.outputTokens ?? 0;

      totalTokens += tt;
      totalInputTokens += it;
      totalOutputTokens += ot;

      if (u.userId) users.add(u.userId);
      if (u.conversationId) conversations.add(u.conversationId);
    });

    return {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCalls: list.length,
      uniqueUsers: users.size,
      uniqueConversations: conversations.size,
    };
  }, [usagePage]);

  const usageList: Usage[] = usagePage?.list ?? [];

  const totalPages =
    usagePage && usagePage.pageSize > 0
      ? Math.max(1, Math.ceil(usagePage.totalRegisters / usagePage.pageSize))
      : 1;

  // Columnas para la tabla de usage, usando userNames
  const usageColumns = useMemo(
    () => [
      {
        key: "createdAt",
        label: "Fecha",
        render: (row: Usage) =>
          new Date(row.createdAt).toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
          }),
      },
      {
        key: "model",
        label: "Modelo",
      },
      {
        key: "userId",
        label: "Usuario",
        render: (row: Usage) => {
          if (!row.userId) return "Anónimo";
          return userNames[row.userId] ?? row.userId;
        },
      },
      {
        key: "conversationId",
        label: "Conversación",
        render: (row: Usage) => row.conversationId ?? "—",
      },
      {
        key: "totalTokens",
        label: "Tokens totales",
        render: (row: Usage) => (row.totalTokens ?? 0).toLocaleString("es-ES"),
      },
    ],
    [userNames]
  );

  const handleUsagePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <BreadcrumbComponent items={[{ label: "Dashboard", active: true }]} />

      <h1 style={{ marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Bienvenido al panel de inteligencia asistencial de Neria.
      </p>

      {loading && (
        <div className="alert alert-info py-2">
          Cargando métricas de uso del chatbot...
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      {/* KPIs principales */}
      {!loading && !error && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-1 text-muted">
                    Tokens totales (página actual)
                  </h6>
                  <h3 className="card-title mb-0">
                    {kpis.totalTokens.toLocaleString("es-ES")}
                  </h3>
                  <small className="text-muted">
                    Input: {kpis.totalInputTokens.toLocaleString("es-ES")} ·
                    Output: {kpis.totalOutputTokens.toLocaleString("es-ES")}
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-1 text-muted">
                    Llamadas al modelo
                  </h6>
                  <h3 className="card-title mb-0">
                    {kpis.totalCalls.toLocaleString("es-ES")}
                  </h3>
                  <small className="text-muted">
                    Registros en esta página: {usageList.length}
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-1 text-muted">
                    Usuarios con actividad
                  </h6>
                  <h3 className="card-title mb-0">
                    {kpis.uniqueUsers.toLocaleString("es-ES")}
                  </h3>
                  <small className="text-muted">
                    Basado en los registros de esta página
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-1 text-muted">
                    Conversaciones activas
                  </h6>
                  <h3 className="card-title mb-0">
                    {kpis.uniqueConversations.toLocaleString("es-ES")}
                  </h3>
                  <small className="text-muted">
                    Conversaciones con consumo registrado (página actual)
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Acceso rápido a secciones */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-2">Accesos rápidos</h5>
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                Gestión centralizada de usuarios, categorías y productos.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <a href="/users" className="btn btn-sm btn-outline-primary">
                  Usuarios
                </a>
                <a
                  href="/categories"
                  className="btn btn-sm btn-outline-secondary"
                >
                  Categorías
                </a>
                <a href="/products" className="btn btn-sm btn-outline-success">
                  Productos
                </a>
              </div>
            </div>
          </div>

          {/* Tabla de últimos registros de uso con paginador */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Últimos registros de uso</h5>

              <TableComponent<Usage>
                data={usageList}
                columns={usageColumns}
                currentPage={usagePage?.pageNumber ?? currentPage}
                totalPages={totalPages}
                onPageChange={handleUsagePageChange}
                bootstrapDesign="striped bordered hover"
                loading={loading}
                actionButtons={[]}
                pagePersist={false}
                sandbox={false}
              />

              {usagePage && (
                <div className="mt-2 text-muted" style={{ fontSize: "0.8rem" }}>
                  Mostrando {usageList.length} de{" "}
                  {usagePage.totalRegisters.toLocaleString("es-ES")} registros
                  totales (página {usagePage.pageNumber} de{" "}
                  {totalPages.toLocaleString("es-ES")}).
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
