// src/ui/pages/ProductsPage.tsx
import React, { useEffect, useMemo, useState } from "react";

import { useProductsContext } from "@/application/context/ProductsContext";
import { useAuthContext } from "@/application/context/AuthContext";
import { createHttpClient } from "@/infrastructure/api/httpClient";
import { ENDPOINTS } from "@/infrastructure/api/endpoints";

import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/domain/interfaces/Product";

import { BreadcrumbComponent } from "../components/BreadcrumbComponent";
import { ModalPortal } from "../components/ModalPortal";
import { TableComponent } from "../components/TableComponent";

const emptyForm: CreateProductPayload = {
  slug: "",
  name: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: undefined,
  vehicleCategoryId: undefined,
  fuelType: "",
  gearbox: "",
  seats: undefined,
  doors: undefined,
  color: "",
  imageUrl: "",
  description: "",
  active: true,
  productLink: "",
  images: [],
};

type CategoryOption = {
  id: number;
  label: string;
};

// Helper para mapear Product -> CreateProductPayload
const mapProductToFormValues = (p: Product): CreateProductPayload => {
  const vehicleCategoryIdRaw = (p as any).vehicleCategoryId;

  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand ?? "",
    model: p.model ?? "",
    year: p.year ?? new Date().getFullYear(),
    price: p.price ?? 0,
    mileage: p.mileage ?? undefined,
    vehicleCategoryId:
      vehicleCategoryIdRaw === null || vehicleCategoryIdRaw === undefined
        ? undefined
        : Number(vehicleCategoryIdRaw),
    fuelType: p.fuelType ?? "",
    gearbox: p.gearbox ?? "",
    seats: p.seats ?? undefined,
    doors: p.doors ?? undefined,
    color: p.color ?? "",
    imageUrl: p.imageUrl ?? "",
    description: (p as any).description ?? "",
    active: p.active ?? true,
    productLink: (p as any).productLink ?? "",
    images: p.images ?? [],
  };
};

export const ProductsPage: React.FC = () => {
  const {
    items,
    loading,
    pageNumber,
    totalPages,
    goToPage,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductsContext();

  const { token } = useAuthContext();

  const [filterValue, setFilterValue] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<CreateProductPayload>(emptyForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => token,
      }),
    [token]
  );

  // Cargar categorías para el combo
  useEffect(() => {
    if (!token) {
      setCategories([]);
      return;
    }

    let cancelled = false;

    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        // Intentamos con el endpoint paginado
        const res: any = await httpClient.get(
          ENDPOINTS.categories.paginated(1, 100)
        );

        const list: any[] = Array.isArray(res?.list)
          ? res.list
          : Array.isArray(res)
          ? res
          : [];

        if (!cancelled) {
          const mapped: CategoryOption[] = list.map((c: any) => ({
            id: c.id,
            label:
              c.label ??
              c.name ??
              c.slug ??
              `Categoría ${typeof c.id === "number" ? c.id : ""}`,
          }));
          setCategories(mapped);
        }
      } catch (error) {
        console.error("Error cargando categorías:", error);
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [httpClient, token]);

  const filteredData = useMemo(() => {
    if (!filterValue) return items;

    const q = filterValue.toLowerCase();

    return items.filter((p) =>
      [p.name, p.brand, p.model]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q))
    );
  }, [items, filterValue]);

  const columns = useMemo(
    () => [
      {
        key: "image",
        label: "Imagen",
        render: (row: Product) => {
          const thumb =
            row.imageUrl ||
            (row.images && row.images.length > 0 ? row.images[0] : null);

          if (!thumb) return null;

          return (
            <img
              src={thumb}
              alt={row.name}
              style={{
                width: 64,
                height: 48,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          );
        },
      },
      { key: "name", label: "Nombre" },
      { key: "brand", label: "Marca" },
      { key: "model", label: "Modelo" },
      {
        key: "price",
        label: "Precio",
        render: (row: Product) =>
          row.price != null ? `${row.price.toLocaleString("es-ES")} €` : "—",
      },
      { key: "fuelType", label: "Combustible" },
      { key: "gearbox", label: "Cambio" },
    ],
    []
  );

  const handlePageChange = (page: number) => {
    void goToPage(page);
  };

  const handleFilter = () => {
    // filtro local; por si quisieras en futuro server-side:
    void refresh();
  };

  const handleRowClick = (row: Product) => {
    setDetailProduct(row);
    setDetailOpen(true);
  };

  const handleNewProduct = () => {
    setFormMode("create");
    setFormValues({
      ...emptyForm,
      year: new Date().getFullYear(),
      active: true,
    });
    setFormOpen(true);
  };

  const handleEditProductFromDetail = () => {
    if (!detailProduct) return;
    setFormMode("edit");
    setFormValues(mapProductToFormValues(detailProduct));
    setFormOpen(true);
  };

  const handleEditProductFromTable = (row: Product) => {
    setDetailProduct(row);
    setFormMode("edit");
    setFormValues(mapProductToFormValues(row));
    setFormOpen(true);
  };

  const handleDeleteProduct = async (row: Product) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `¿Seguro que quieres eliminar el producto "${row.name}"?`
    );
    if (!ok) return;

    try {
      await deleteProduct(row.id);
      if (detailProduct && detailProduct.id === row.id) {
        setDetailOpen(false);
        setDetailProduct(null);
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      // eslint-disable-next-line no-alert
      alert("Error eliminando el producto. Revisa la consola.");
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "active") {
      const input = e.target as HTMLInputElement;
      setFormValues((prev) => ({
        ...prev,
        active: input.checked,
      }));
      return;
    }

    if (name === "year" || name === "price" || name === "mileage") {
      setFormValues((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    if (name === "images") {
      const imagesArray = value
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
      setFormValues((prev) => ({
        ...prev,
        images: imagesArray,
      }));
      return;
    }

    if (name === "vehicleCategoryId") {
      setFormValues((prev) => ({
        ...prev,
        vehicleCategoryId: value === "" ? undefined : Number(value),
      }));
      return;
    }

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
        await createProduct(formValues);
      } else if (formMode === "edit" && detailProduct) {
        const updatePayload: UpdateProductPayload = {
          ...formValues,
        };
        await updateProduct(detailProduct.id, updatePayload);
      }

      setFormOpen(false);
    } catch (error) {
      console.error("Error guardando producto:", error);
      // eslint-disable-next-line no-alert
      alert("Error guardando el producto. Revisa la consola.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const actionButtons = ["Editar", "Eliminar"];

  const actionHandlers = {
    Editar: (row: Product) => handleEditProductFromTable(row),
    Eliminar: (row: Product) => {
      void handleDeleteProduct(row);
    },
  };

  return (
    <div className="container-fluid">
      <BreadcrumbComponent
        items={[
          { label: "Inicio", to: "/" },
          { label: "Productos", active: true },
        ]}
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Listado de productos</h5>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleNewProduct}
            >
              + Nuevo producto
            </button>
          </div>

          <TableComponent<Product>
            data={filteredData}
            columns={columns}
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            bootstrapDesign="striped bordered hover"
            filterLabel="Filtrar por nombre / marca / modelo"
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onFilter={handleFilter}
            sortBy=""
            sortDirection=""
            loading={loading}
            actionButtons={actionButtons}
            actionHandlers={actionHandlers}
            pagePersist={false}
            sandbox={false}
            onRowClick={handleRowClick}
            rowClickable
            getRowKey={(row) => row.id}
          />
        </div>
      </div>

      {/* Modal de detalle */}
      <ModalPortal
        open={detailOpen && !!detailProduct}
        onClose={() => setDetailOpen(false)}
        title={detailProduct ? `Detalle: ${detailProduct.name}` : "Detalle"}
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
            {detailProduct && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleEditProductFromDetail}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => void handleDeleteProduct(detailProduct)}
                >
                  Eliminar
                </button>
              </>
            )}
          </>
        }
      >
        {detailProduct && (
          <div className="row">
            <div className="col-md-5 mb-3">
              {(() => {
                const thumb =
                  detailProduct.imageUrl ||
                  (detailProduct.images &&
                    detailProduct.images.length > 0 &&
                    detailProduct.images[0]);
                if (!thumb) {
                  return (
                    <div className="bg-light border rounded d-flex align-items-center justify-content-center">
                      <span className="text-muted" style={{ padding: "3rem" }}>
                        Sin imagen
                      </span>
                    </div>
                  );
                }
                return (
                  <img
                    src={thumb}
                    alt={detailProduct.name}
                    className="img-fluid rounded border"
                  />
                );
              })()}
              {detailProduct.images && detailProduct.images.length > 1 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {detailProduct.images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${detailProduct.name} ${idx + 2}`}
                      style={{
                        width: 72,
                        height: 54,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="col-md-7">
              <dl className="row mb-0">
                <dt className="col-sm-4">Nombre</dt>
                <dd className="col-sm-8">{detailProduct.name}</dd>

                <dt className="col-sm-4">Slug</dt>
                <dd className="col-sm-8">{detailProduct.slug}</dd>

                <dt className="col-sm-4">Marca</dt>
                <dd className="col-sm-8">{detailProduct.brand || "—"}</dd>

                <dt className="col-sm-4">Modelo</dt>
                <dd className="col-sm-8">{detailProduct.model || "—"}</dd>

                <dt className="col-sm-4">Año</dt>
                <dd className="col-sm-8">{detailProduct.year || "—"}</dd>

                <dt className="col-sm-4">Precio</dt>
                <dd className="col-sm-8">
                  {detailProduct.price != null
                    ? `${detailProduct.price.toLocaleString("es-ES")} €`
                    : "—"}
                </dd>

                <dt className="col-sm-4">Kilometraje</dt>
                <dd className="col-sm-8">
                  {detailProduct.mileage != null
                    ? `${detailProduct.mileage.toLocaleString("es-ES")} km`
                    : "—"}
                </dd>

                <dt className="col-sm-4">Combustible</dt>
                <dd className="col-sm-8">{detailProduct.fuelType || "—"}</dd>

                <dt className="col-sm-4">Cambio</dt>
                <dd className="col-sm-8">{detailProduct.gearbox || "—"}</dd>

                <dt className="col-sm-4">Color</dt>
                <dd className="col-sm-8">{detailProduct.color || "—"}</dd>

                <dt className="col-sm-4">Activa</dt>
                <dd className="col-sm-8">
                  {detailProduct.active ? "Sí" : "No"}
                </dd>

                <dt className="col-sm-4">Enlace</dt>
                <dd className="col-sm-8">
                  {(detailProduct as any).productLink ? (
                    <a
                      href={(detailProduct as any).productLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver ficha externa
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>

                <dt className="col-sm-4">Descripción</dt>
                <dd className="col-sm-8">
                  {(detailProduct as any).description || "—"}
                </dd>
              </dl>
            </div>
          </div>
        )}
      </ModalPortal>

      {/* Modal de formulario (crear/editar) */}
      <ModalPortal
        open={formOpen}
        onClose={() => !formSubmitting && setFormOpen(false)}
        title={
          formMode === "create" ? "Nuevo producto" : "Editar producto existente"
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
              form="product-form"
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
        <form id="product-form" onSubmit={handleFormSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre *</label>
              <input
                className="form-control form-control-sm"
                name="name"
                value={formValues.name}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Slug *</label>
              <input
                className="form-control form-control-sm"
                name="slug"
                value={formValues.slug}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Marca</label>
              <input
                className="form-control form-control-sm"
                name="brand"
                value={formValues.brand ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Modelo</label>
              <input
                className="form-control form-control-sm"
                name="model"
                value={formValues.model ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="year"
                value={formValues.year ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Precio (€)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="price"
                value={formValues.price ?? ""}
                onChange={handleFormChange}
                min={0}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Kilometraje (km)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="mileage"
                value={formValues.mileage ?? ""}
                onChange={handleFormChange}
                min={0}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Combustible</label>
              <input
                className="form-control form-control-sm"
                name="fuelType"
                value={formValues.fuelType ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Cambio</label>
              <input
                className="form-control form-control-sm"
                name="gearbox"
                value={formValues.gearbox ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Plazas</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="seats"
                value={formValues.seats ?? ""}
                onChange={handleFormChange}
                min={1}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Puertas</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="doors"
                value={formValues.doors ?? ""}
                onChange={handleFormChange}
                min={2}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Categoría vehículo</label>
              <select
                className="form-select form-select-sm"
                name="vehicleCategoryId"
                value={formValues.vehicleCategoryId ?? ""}
                onChange={handleFormChange}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <small className="text-muted">Cargando categorías...</small>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">Color</label>
              <input
                className="form-control form-control-sm"
                name="color"
                value={formValues.color ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">URL imagen principal</label>
              <input
                className="form-control form-control-sm"
                name="imageUrl"
                value={formValues.imageUrl ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Imágenes adicionales (una URL por línea)
              </label>
              <textarea
                className="form-control form-control-sm"
                name="images"
                rows={3}
                value={(formValues.images || []).join("\n")}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control form-control-sm"
                name="description"
                rows={3}
                value={formValues.description ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-8">
              <label className="form-label">Enlace ficha externa</label>
              <input
                className="form-control form-control-sm"
                name="productLink"
                value={formValues.productLink ?? ""}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-md-4 d-flex align-items-center mt-3 mt-md-4">
              <div className="form-check">
                <input
                  id="active"
                  className="form-check-input"
                  type="checkbox"
                  name="active"
                  checked={!!formValues.active}
                  onChange={handleFormChange}
                />
                <label className="form-check-label" htmlFor="active">
                  Activo
                </label>
              </div>
            </div>
          </div>
        </form>
      </ModalPortal>
    </div>
  );
};

export default ProductsPage;
