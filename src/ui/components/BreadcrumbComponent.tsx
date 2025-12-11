// src/components/BreadcrumbComponent.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
  active?: boolean;
}

interface BreadcrumbComponentProps {
  /**
   * Si se pasa `items`, se usa este modo manual.
   * Si no se pasa, se genera automáticamente a partir de la URL.
   */
  items?: BreadcrumbItem[];
}

export const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({
  items,
}) => {
  const location = useLocation();

  // MODO MANUAL: si hay items, los usamos tal cual
  if (items && items.length > 0) {
    return (
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          {items.map((item, idx) => {
            const isLast = item.active ?? idx === items.length - 1;
            const content =
              isLast || !item.to ? (
                item.label
              ) : (
                <Link to={item.to}>{item.label}</Link>
              );

            return (
              <li
                key={`${item.label}-${idx}`}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {content}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // MODO AUTOMÁTICO: igual que antes, basado en la URL
  const segments = location.pathname.split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    "": "Dashboard",
    users: "Usuarios",
    categories: "Categorías",
    products: "Productos",
    documentacio: "Documentació",
    settings: "Configuración",
  };

  const crumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    const isLast = idx === segments.length - 1;

    const rawLabel = labelMap[seg] ?? seg.replace(/-/g, " ");
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

    return { path, label, isLast };
  });

  return (
    <nav aria-label="breadcrumb" className="mb-2">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/">Inici</Link>
        </li>

        {crumbs.map((c) => (
          <li
            key={c.path}
            className={`breadcrumb-item ${c.isLast ? "active" : ""}`}
            aria-current={c.isLast ? "page" : undefined}
          >
            {c.isLast ? c.label : <Link to={c.path}>{c.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
};
