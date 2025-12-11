import React, { useEffect } from "react";

export interface TableColumn<T = any> {
  key: string; // clave del objeto (e.g. "email", "name")
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableComponentProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];

  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  actionButtons?: string[];
  actionHandlers?: Record<string, (item: T) => void>;

  bootstrapDesign?: string; // "striped", "striped bordered", etc.

  filterLabel?: string;
  filterValue?: string;
  setFilterValue?: (value: string) => void;
  onFilter?: () => void;

  onSortChange?: (sortBy: string, direction: "asc" | "desc") => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | "";

  className?: string;
  paginationClassName?: string;

  pagePersist?: boolean;
  persistKey?: string;

  columnWidths?: Record<string, string | number>;
  sandbox?: boolean; // ahora mismo sin uso, pero lo aceptamos

  loading?: boolean;

  onRowClick?: (row: T) => void;
  rowClickable?: boolean;
  getRowKey?: (row: T, index: number) => React.Key;
}

export const TableComponent = <T,>({
  data,
  columns,
  currentPage,
  totalPages,
  onPageChange,
  actionButtons = [],
  actionHandlers = {},
  bootstrapDesign = "striped",
  filterLabel,
  filterValue,
  setFilterValue,
  onFilter,
  onSortChange,
  sortBy = "",
  sortDirection = "",
  className = "",
  paginationClassName = "",
  pagePersist = false,
  persistKey,
  columnWidths = {},
  loading = false,
  onRowClick,
  rowClickable = false,
  getRowKey,
}: TableComponentProps<T>) => {
  // Persistencia de página (opcional)
  useEffect(() => {
    if (!pagePersist || !persistKey) return;

    const key = `table_page_${persistKey}`;
    const stored = localStorage.getItem(key);
    const storedPage = stored ? parseInt(stored, 10) : NaN;

    if (
      storedPage &&
      !Number.isNaN(storedPage) &&
      storedPage >= 1 &&
      storedPage <= totalPages &&
      storedPage !== currentPage
    ) {
      onPageChange(storedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    if (pagePersist && persistKey) {
      const key = `table_page_${persistKey}`;
      localStorage.setItem(key, String(page));
    }
    onPageChange(page);
  };

  const handleHeaderClick = (colKey: string) => {
    if (!onSortChange) return;

    let nextDir: "asc" | "desc" = "asc";
    if (sortBy === colKey && sortDirection === "asc") {
      nextDir = "desc";
    }
    onSortChange(colKey, nextDir);
  };

  const tableClasses = ["table"];
  if (bootstrapDesign.includes("striped")) tableClasses.push("table-striped");
  if (bootstrapDesign.includes("bordered")) tableClasses.push("table-bordered");
  if (bootstrapDesign.includes("hover")) tableClasses.push("table-hover");

  if (className) tableClasses.push(className);

  const renderCellValue = (row: T, col: TableColumn<T>) => {
    if (col.render) return col.render(row);

    // @ts-expect-error – acceso dinámico
    const raw = row[col.key];
    if (raw == null) return "";

    return String(raw);
  };

  const pagesToShow = () => {
    const pages: number[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push(-1); // -1 => "..."
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < totalPages - 1) pages.push(-1);
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div>
      {/* Filtro superior */}
      {filterLabel && setFilterValue && (
        <div className="d-flex align-items-center mb-3 gap-2">
          <label style={{ fontSize: "0.9rem", marginRight: "0.5rem" }}>
            {filterLabel}
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: 260 }}
            value={filterValue ?? ""}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onFilter) {
                onFilter();
              }
            }}
          />
          {onFilter && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={onFilter}
            >
              Buscar
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-2 text-muted" style={{ fontSize: "0.85rem" }}>
          Cargando datos...
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <table className={tableClasses.join(" ")}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                const arrow =
                  isSorted && sortDirection
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : "";
                const width = columnWidths[col.key];

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{
                      cursor: onSortChange ? "pointer" : "default",
                      width: width ?? undefined,
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => handleHeaderClick(col.key)}
                  >
                    {col.label}{" "}
                    {arrow && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          marginLeft: 4,
                        }}
                      >
                        {arrow}
                      </span>
                    )}
                  </th>
                );
              })}

              {actionButtons.length > 0 && (
                <th style={{ whiteSpace: "nowrap" }} className="text-end">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actionButtons.length > 0 ? 1 : 0)}
                  className="text-center text-muted py-3"
                >
                  No hay registros para mostrar.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = getRowKey ? getRowKey(row, idx) : idx;
                return (
                  <tr
                    key={key}
                    onClick={
                      onRowClick
                        ? () => {
                            onRowClick(row);
                          }
                        : undefined
                    }
                    style={{
                      cursor:
                        rowClickable && onRowClick ? "pointer" : "default",
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>{renderCellValue(row, col)}</td>
                    ))}

                    {actionButtons.length > 0 && (
                      <td
                        className="text-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actionButtons.map((btnKey) => {
                          const handler = actionHandlers[btnKey];
                          return (
                            <button
                              key={btnKey}
                              type="button"
                              className="btn btn-sm btn-outline-secondary ms-1"
                              onClick={() => handler && handler(row)}
                            >
                              {btnKey}
                            </button>
                          );
                        })}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav
          className={`mt-2 d-flex justify-content-end ${paginationClassName}`}
        >
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                type="button"
                onClick={() => handlePageClick(currentPage - 1)}
              >
                «
              </button>
            </li>

            {pagesToShow().map((p, i) =>
              p === -1 ? (
                <li key={`ellipsis-${i}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              ) : (
                <li
                  key={p}
                  className={`page-item ${p === currentPage ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    type="button"
                    onClick={() => handlePageClick(p)}
                  >
                    {p}
                  </button>
                </li>
              )
            )}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                type="button"
                onClick={() => handlePageClick(currentPage + 1)}
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};
