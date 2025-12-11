import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuthContext } from "./AuthContext";
import { createHttpClient } from "@/infrastructure/api/httpClient";
import { ProductsService } from "@/domain/services/ProductsService";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/domain/interfaces/Product";

const DEFAULT_PAGE_SIZE = 10;

interface ProductsContextValue {
  items: Product[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalRegisters: number;
  totalPages: number;

  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;

  createProduct: (payload: CreateProductPayload) => Promise<Product>;
  updateProduct: (
    id: string,
    payload: UpdateProductPayload
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({
  children,
}) => {
  const { token } = useAuthContext();

  const [items, setItems] = useState<Product[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalRegisters, setTotalRegisters] = useState(0);
  const [loading, setLoading] = useState(false);

  const httpClient = useMemo(
    () =>
      createHttpClient({
        getToken: () => token,
      }),
    [token]
  );

  const productsService = useMemo(
    () => new ProductsService(httpClient),
    [httpClient]
  );

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalRegisters / pageSize)) : 1;

  const loadPage = useCallback(
    async (page: number) => {
      if (!token) {
        setItems([]);
        setTotalRegisters(0);
        setPageNumber(1);
        return;
      }

      setLoading(true);
      try {
        const res = await productsService.listPaginated(page, pageSize);
        setItems(res.list || []);
        setPageNumber(res.pageNumber);
        setPageSize(res.pageSize);
        setTotalRegisters(res.totalRegisters);
      } catch (error) {
        console.error("Error cargando productos (context):", error);
        setItems([]);
        setTotalRegisters(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, productsService, token]
  );

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1) return;
      await loadPage(page);
    },
    [loadPage]
  );

  const refresh = useCallback(async () => {
    await loadPage(pageNumber || 1);
  }, [loadPage, pageNumber]);

  const createProduct = useCallback(
    async (payload: CreateProductPayload) => {
      const created = await productsService.create(payload);
      // estrategia simple: recargar página actual
      await refresh();
      return created;
    },
    [productsService, refresh]
  );

  const updateProduct = useCallback(
    async (id: string, payload: UpdateProductPayload) => {
      const updated = await productsService.update(id, payload);
      await refresh();
      return updated;
    },
    [productsService, refresh]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await productsService.delete(id);
      await refresh();
    },
    [productsService, refresh]
  );

  useEffect(() => {
    if (token) {
      void loadPage(1);
    } else {
      setItems([]);
      setTotalRegisters(0);
      setPageNumber(1);
    }
  }, [token, loadPage]);

  const value: ProductsContextValue = {
    items,
    loading,
    pageNumber,
    pageSize,
    totalRegisters,
    totalPages,
    goToPage,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = (): ProductsContextValue => {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error(
      "useProductsContext debe usarse dentro de ProductsProvider"
    );
  }
  return ctx;
};
