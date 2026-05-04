import { useEffect, useState } from "react";
import { clientesApi, facturasApi, productosApi } from "./api/services";
import { Layout } from "./components/Layout";
import { ToastProvider, useToast } from "./components/Toast";
import { DashboardSkeleton } from "./components/Skeleton";
import { useAuth } from "./context/AuthContext";
import { Clientes } from "./pages/Clientes";
import { Dashboard } from "./pages/Dashboard";
import { Facturas } from "./pages/Facturas";
import { Login } from "./pages/Login";
import { Productos } from "./pages/Productos";
import type { Cliente, Factura, Producto } from "./types";

type Tab = "dashboard" | "clientes" | "productos" | "facturas";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  async function loadData() {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [c, p, f] = await Promise.all([
        clientesApi.listar(),
        productosApi.listar(),
        facturasApi.listar(),
      ]);
      setClientes(c);
      setProductos(p);
      setFacturas(f);
    } catch {
      toast.error(
        "No se pudo conectar con la API. Verifica que tu backend esté corriendo en http://localhost:5000."
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Login />;

  return (
    <Layout tab={tab} setTab={setTab}>
      {initialLoad && loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {tab === "dashboard" && (
            <Dashboard
              clientes={clientes}
              productos={productos}
              facturas={facturas}
            />
          )}
          {tab === "clientes" && (
            <Clientes clientes={clientes} onReload={loadData} />
          )}
          {tab === "productos" && (
            <Productos productos={productos} onReload={loadData} />
          )}
          {tab === "facturas" && (
            <Facturas
              clientes={clientes}
              productos={productos}
              facturas={facturas}
              onReload={loadData}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
