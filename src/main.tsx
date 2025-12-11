import "./index.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./ui/routes/AppRouter";
import { AuthProvider } from "./application/context/AuthContext";
import { ProductsProvider } from "./application/context/ProductsContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <AppRouter />
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>
);
