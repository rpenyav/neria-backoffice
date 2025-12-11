// src/ui/pages/CategoriesPage.tsx
import React, { useEffect, useMemo, useState } from "react";

import { useAuthContext } from "@/application/context/AuthContext";
import { createHttpClient } from "@/infrastructure/api/httpClient";
import { CategoriesService } from "@/domain/services/CategoriesService";
import type { Category } from "@/domain/interfaces/Category";

import { BreadcrumbComponent } from "../components/BreadcrumbComponent";
import { TableComponent } from "../components/TableComponent";
import { ModalPortal } from "../components/ModalPortal";

const PAGE_SIZE_DEFAULT = 10;

const categoryColumns = [
  { key: "name", label: "Nombre" },
  { key: "code", label: "Código" },
  { key: "slug", label: "Slug" },
  { key: "description", label: "Descripción" },
];

type CategoryFormValues = Omit<Category, "id">;

const emptyForm: CategoryFormValues = {
  name: "",
  code: "",
  slug: "",
  description: "",
};

const mapCategoryToFormValues = (cat: Category): CategoryFormValues => ({
  name: cat.name ?? "",
  code: cat.code ?? "",
  slug: cat.slug ?? "",
  description: cat.description ?? "",
});

export const CategoriesPage: React.FC = () => {
  const { token } = useAuthContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE_DEFAULT);
  const [totalRegisters, setTotalRegisters] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  // Detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);

  // Formulario (create/edit)
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<CategoryFormValues>(emptyForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => token,
      }),
    [token]
  );

  const categoriesService = useMemo(
    () => new CategoriesService(httpClient),
    [httpClient]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalRegisters / (pageSize || PAGE_SIZE_DEFAULT))
  );

  const fetchCategories = async (pageToLoad: number) => {
    setLoading(true);
    try {
      const response = await categoriesService.getPaginated(
        pageToLoad,
        pageSize
      );

      setCategories(response.list);
      setTotalRegisters(response.totalRegisters);
      setPage(response.pageNumber);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void fetchCategories(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void fetchCategories(newPage);
  };

  const filteredData = useMemo(() => {
    if (!filterValue) return categories;
    const q = filterValue.toLowerCase();
    return categories.filter((cat) => {
      return (
        cat.name?.toLowerCase().includes(q) ||
        cat.code?.toLowerCase().includes(q) ||
        cat.slug?.toLowerCase().includes(q) ||
        (cat.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [categories, filterValue]);

  const effectiveTotalPages = Math.max(
    1,
    Math.ceil((filterValue ? filteredData.length : totalRegisters) / pageSize)
  );

  // ---- CRUD handlers ----

  const handleRowClick = (row: Category) => {
    setDetailCategory(row);
    setDetailOpen(true);
  };

  const handleNewCategory = () => {
    setFormMode("create");
    setFormValues(emptyForm);
    setFormOpen(true);
  };

  const handleEditCategoryFromDetail = () => {
    if (!detailCategory) return;
    setFormMode("edit");
    setFormValues(mapCategoryToFormValues(detailCategory));
    setFormOpen(true);
  };

  const handleEditCategoryFromTable = (row: Category) => {
    setDetailCategory(row);
    setFormMode("edit");
    setFormValues(mapCategoryToFormValues(row));
    setFormOpen(true);
  };

  const handleDeleteCategory = async (row: Category) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `¿Seguro que quieres eliminar la categoría "${row.name}"?`
    );
    if (!ok) return;

    try {
      await categoriesService.delete(row.id);
      // refrescamos la página actual
      await fetchCategories(page);
      if (detailCategory && detailCategory.id === row.id) {
        setDetailOpen(false);
        setDetailCategory(null);
      }
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      // eslint-disable-next-line no-alert
      alert("Error eliminando la categoría. Revisa la consola.");
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (formMode === "create") {
        await categoriesService.create(formValues);
      } else if (formMode === "edit" && detailCategory) {
        await categoriesService.update(detailCategory.id, formValues);
      }

      setFormOpen(false);
      // refrescamos la página actual (o volvemos a la 1 si quieres)
      await fetchCategories(page);
    } catch (error) {
      console.error("Error guardando categoría:", error);
      // eslint-disable-next-line no-alert
      alert("Error guardando la categoría. Revisa la consola.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const actionButtons = ["Editar", "Eliminar"];

  const actionHandlers = {
    Editar: (row: Category) => handleEditCategoryFromTable(row),
    Eliminar: (row: Category) => {
      void handleDeleteCategory(row);
    },
  };

  return (
    <div className="container mt-3">
      <BreadcrumbComponent
        items={[
          { label: "Inicio", to: "/" },
          { label: "Categorías", active: true },
        ]}
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Categorías de vehículos</h5>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleNewCategory}
            >
              + Nueva categoría
            </button>
          </div>

          <TableComponent<Category>
            data={filteredData}
            columns={categoryColumns}
            currentPage={page}
            totalPages={effectiveTotalPages}
            onPageChange={handlePageChange}
            filterLabel="Filtrar por nombre, código, slug o descripción..."
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onFilter={() => {
              // al filtrar, volvemos a la página 1 (solo a nivel UI)
              setPage(1);
            }}
            loading={loading}
            actionButtons={actionButtons}
            actionHandlers={actionHandlers}
            rowClickable
            onRowClick={handleRowClick}
            getRowKey={(row) => String(row.id)}
          />
        </div>
      </div>

      {/* Modal detalle */}
      <ModalPortal
        open={detailOpen && !!detailCategory}
        onClose={() => setDetailOpen(false)}
        title={
          detailCategory
            ? `Detalle categoría: ${detailCategory.name}`
            : "Detalle categoría"
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
            {detailCategory && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleEditCategoryFromDetail}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => void handleDeleteCategory(detailCategory)}
                >
                  Eliminar
                </button>
              </>
            )}
          </>
        }
      >
        {detailCategory && (
          <dl className="row mb-0">
            <dt className="col-sm-4">Nombre</dt>
            <dd className="col-sm-8">{detailCategory.name}</dd>

            <dt className="col-sm-4">Código</dt>
            <dd className="col-sm-8">{detailCategory.code}</dd>

            <dt className="col-sm-4">Slug</dt>
            <dd className="col-sm-8">{detailCategory.slug}</dd>

            <dt className="col-sm-4">Descripción</dt>
            <dd className="col-sm-8">{detailCategory.description || "—"}</dd>
          </dl>
        )}
      </ModalPortal>

      {/* Modal formulario create/edit */}
      <ModalPortal
        open={formOpen}
        onClose={() => !formSubmitting && setFormOpen(false)}
        title={
          formMode === "create"
            ? "Nueva categoría de vehículo"
            : "Editar categoría"
        }
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
              form="category-form"
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
        <form id="category-form" onSubmit={handleFormSubmit}>
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

          <div className="mb-3">
            <label className="form-label">Código *</label>
            <input
              className="form-control form-control-sm"
              name="code"
              value={formValues.code}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Slug *</label>
            <input
              className="form-control form-control-sm"
              name="slug"
              value={formValues.slug}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="mb-0">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control form-control-sm"
              name="description"
              rows={3}
              value={formValues.description ?? ""}
              onChange={handleFormChange}
            />
          </div>
        </form>
      </ModalPortal>
    </div>
  );
};

export default CategoriesPage;
