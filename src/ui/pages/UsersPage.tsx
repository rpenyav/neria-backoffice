// src/ui/pages/UsersPage.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";

import { useAuthContext } from "@/application/context/AuthContext";
import { createHttpClient } from "@/infrastructure/api/httpClient";
import { UsersService } from "@/domain/services/UsersService";
import type { UpdateUserPayload, User } from "@/domain/interfaces/User";

import { BreadcrumbComponent } from "../components/BreadcrumbComponent";
import { TableComponent } from "../components/TableComponent";
import { ModalPortal } from "../components/ModalPortal";

const PAGE_SIZE = 10;

interface UserFormState {
  email: string;
  name: string;
  password: string; // sólo se usa en create y en edit si quieres cambiarla
}

const emptyForm: UserFormState = {
  email: "",
  name: "",
  password: "",
};

export const UsersPage: React.FC = () => {
  const { token } = useAuthContext();

  const [users, setUsers] = useState<User[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRegisters, setTotalRegisters] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filterValue, setFilterValue] = useState("");

  // Detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Formulario
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<UserFormState>(emptyForm);
  const [formUserId, setFormUserId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Http + service
  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => token,
      }),
    [token]
  );

  const usersService = useMemo(
    () => new UsersService(httpClient),
    [httpClient]
  );

  const totalPages =
    PAGE_SIZE > 0 ? Math.max(1, Math.ceil(totalRegisters / PAGE_SIZE)) : 1;

  const fetchPage = useCallback(
    async (page: number) => {
      if (!token) {
        setUsers([]);
        setTotalRegisters(0);
        setPageNumber(1);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await usersService.listUsersPaginated(page, PAGE_SIZE);
        setUsers(res.list ?? []);
        setPageNumber(res.pageNumber ?? page);
        setTotalRegisters(res.totalRegisters ?? 0);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setErrorMsg(error?.message ?? "Error cargando usuarios");
        setUsers([]);
        setTotalRegisters(0);
      } finally {
        setLoading(false);
      }
    },
    [token, usersService]
  );

  useEffect(() => {
    if (token) {
      void fetchPage(1);
    } else {
      setUsers([]);
      setTotalRegisters(0);
      setPageNumber(1);
    }
  }, [token, fetchPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    void fetchPage(page);
  };

  // Filtro local sobre la página actual
  const filteredData = useMemo(() => {
    if (!filterValue.trim()) return users;
    const q = filterValue.toLowerCase();
    return users.filter((u) => {
      const email = u.email?.toLowerCase() ?? "";
      const name = u.name?.toLowerCase() ?? "";
      return email.includes(q) || name.includes(q);
    });
  }, [users, filterValue]);

  const columns = useMemo(
    () => [
      {
        key: "email",
        label: "Email",
      },
      {
        key: "name",
        label: "Nombre",
      },
      {
        key: "createdAt",
        label: "Creado",
        render: (u: User) =>
          u.createdAt ? new Date(u.createdAt).toLocaleString("es-ES") : "—",
      },
    ],
    []
  );

  const handleRowClick = (row: User) => {
    setDetailUser(row);
    setDetailOpen(true);
  };

  const handleNewUser = () => {
    setFormMode("create");
    setFormUserId(null);
    setFormValues({ ...emptyForm });
    setFormOpen(true);
  };

  const handleEditFromDetail = () => {
    if (!detailUser) return;
    setFormMode("edit");
    setFormUserId(detailUser.id);
    setFormValues({
      email: detailUser.email,
      name: detailUser.name ?? "",
      password: "",
    });
    setFormOpen(true);
  };

  const handleEditFromTable = (row: User) => {
    setDetailUser(row);
    setFormMode("edit");
    setFormUserId(row.id);
    setFormValues({
      email: row.email,
      name: row.name ?? "",
      password: "",
    });
    setFormOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `¿Seguro que quieres eliminar al usuario "${user.email}"?`
    );
    if (!ok) return;

    try {
      await usersService.deleteUser(user.id);
      if (detailUser && detailUser.id === user.id) {
        setDetailOpen(false);
        setDetailUser(null);
      }
      await fetchPage(pageNumber);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      // eslint-disable-next-line no-alert
      alert("Error eliminando el usuario. Revisa la consola.");
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (formMode === "create") {
        await usersService.createUser({
          email: formValues.email,
          name: formValues.name,
          password: formValues.password,
        });
        await fetchPage(1);
      } else if (formMode === "edit" && formUserId) {
        const payload: UpdateUserPayload = {};

        if (formValues.name.trim()) {
          payload.name = formValues.name.trim();
        }

        // opcionalmente podrías permitir cambiar email si el backend lo soporta:
        // if (formValues.email.trim()) {
        //   payload.email = formValues.email.trim();
        // }

        if (formValues.password.trim()) {
          payload.password = formValues.password.trim();
        }

        await usersService.updateUserById(formUserId, payload);
        await fetchPage(pageNumber);
      }

      setFormOpen(false);
    } catch (error) {
      console.error("Error guardando usuario:", error);
      // eslint-disable-next-line no-alert
      alert("Error guardando el usuario. Revisa la consola.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const actionButtons = ["Editar", "Eliminar"] as const;

  const actionHandlers: Record<string, (user: User) => void> = {
    Editar: (row: User) => handleEditFromTable(row),
    Eliminar: (row: User) => {
      void handleDeleteUser(row);
    },
  };

  return (
    <div className="container-fluid">
      <BreadcrumbComponent
        items={[
          { label: "Inicio", to: "/" },
          { label: "Usuarios", active: true },
        ]}
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Listado de usuarios</h5>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleNewUser}
            >
              + Nuevo usuario
            </button>
          </div>

          {errorMsg && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMsg}
            </div>
          )}

          <TableComponent<User>
            data={filteredData}
            columns={columns}
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            bootstrapDesign="striped bordered hover"
            filterLabel="Filtrar por email / nombre"
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onFilter={() => {
              // filtro local, no hace falta refetch
            }}
            sortBy=""
            sortDirection=""
            loading={loading}
            actionButtons={actionButtons as unknown as string[]}
            actionHandlers={actionHandlers}
            pagePersist={false}
            sandbox={false}
            onRowClick={handleRowClick}
            rowClickable
            getRowKey={(row) => row.id}
          />
        </div>
      </div>

      {/* Modal detalle */}
      <ModalPortal
        open={detailOpen && !!detailUser}
        onClose={() => setDetailOpen(false)}
        title={
          detailUser
            ? `Detalle usuario: ${detailUser.email}`
            : "Detalle usuario"
        }
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setDetailOpen(false)}
            >
              Cerrar
            </button>
            {detailUser && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleEditFromDetail}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => void handleDeleteUser(detailUser)}
                >
                  Eliminar
                </button>
              </>
            )}
          </>
        }
      >
        {detailUser && (
          <dl className="row mb-0">
            <dt className="col-sm-4">ID</dt>
            <dd className="col-sm-8">{detailUser.id}</dd>

            <dt className="col-sm-4">Email</dt>
            <dd className="col-sm-8">{detailUser.email}</dd>

            <dt className="col-sm-4">Nombre</dt>
            <dd className="col-sm-8">{detailUser.name || "—"}</dd>

            <dt className="col-sm-4">Creado</dt>
            <dd className="col-sm-8">
              {detailUser.createdAt
                ? new Date(detailUser.createdAt).toLocaleString("es-ES")
                : "—"}
            </dd>

            <dt className="col-sm-4">Actualizado</dt>
            <dd className="col-sm-8">
              {detailUser.updatedAt
                ? new Date(detailUser.updatedAt).toLocaleString("es-ES")
                : "—"}
            </dd>
          </dl>
        )}
      </ModalPortal>

      {/* Modal formulario crear/editar */}
      <ModalPortal
        open={formOpen}
        onClose={() => !formSubmitting && setFormOpen(false)}
        title={formMode === "create" ? "Nuevo usuario" : "Editar usuario"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => !formSubmitting && setFormOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="user-form"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? "Guardando..."
                : formMode === "create"
                ? "Crear"
                : "Guardar cambios"}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control form-control-sm"
              name="email"
              value={formValues.email}
              onChange={handleFormChange}
              required
              disabled={formMode === "edit"} // no dejamos cambiar email en edición
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              className="form-control form-control-sm"
              name="name"
              value={formValues.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-0">
            <label className="form-label">
              {formMode === "create"
                ? "Contraseña *"
                : "Nueva contraseña (dejar vacío para no cambiar)"}
            </label>
            <input
              type="password"
              className="form-control form-control-sm"
              name="password"
              value={formValues.password}
              onChange={handleFormChange}
              required={formMode === "create"}
            />
          </div>
        </form>
      </ModalPortal>
    </div>
  );
};

export default UsersPage;
