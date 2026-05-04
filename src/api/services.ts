import { http } from "./http";
import type {
  Cliente,
  DashboardResumen,
  Factura,
  FacturaDetalleRequest,
  LoginResponse,
  Producto,
  TopCliente,
  VentaMensual,
} from "../types";

export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await http.post<LoginResponse>("/Auth/login", {
      username,
      password,
    });
    return data;
  },
};

export const dashboardApi = {
  resumen: async (): Promise<DashboardResumen> => {
    const { data } = await http.get("/Dashboard/resumen");
    return data;
  },

  ventasMensuales: async (): Promise<VentaMensual[]> => {
    const { data } = await http.get("/Dashboard/ventas-mensuales");
    return data;
  },

  topClientes: async (): Promise<TopCliente[]> => {
    const { data } = await http.get("/Dashboard/top-clientes");
    return data;
  },
};

export const clientesApi = {
  listar: async () => {
    const { data } = await http.get<Cliente[]>("/Clientes");
    return data;
  },

  crear: async (payload: Omit<Cliente, "id">) => {
    const { data } = await http.post<Cliente>("/Clientes", payload);
    return data;
  },

  eliminar: async (id: number) => {
    await http.delete(`/Clientes/${id}`);
  },
};

export const productosApi = {
  listar: async () => {
    const { data } = await http.get<Producto[]>("/Productos");
    return data;
  },

  crear: async (payload: Omit<Producto, "id">) => {
    const { data } = await http.post<Producto>("/Productos", payload);
    return data;
  },

  actualizar: async (
    id: number,
    payload: { nombre: string; precio: number; stock: number }
  ) => {
    const { data } = await http.put<Producto>(`/Productos/${id}`, payload);
    return data;
  },

  eliminar: async (id: number) => {
    await http.delete(`/Productos/${id}`);
  },
};

export const facturasApi = {
  listar: async () => {
    const { data } = await http.get<Factura[]>("/Facturas");
    return data;
  },

  emitir: async (clienteId: number, detalles: FacturaDetalleRequest[]) => {
    const { data } = await http.post<Factura>("/Facturas/emitir", {
      clienteId,
      detalles,
    });
    return data;
  },

  anular: async (id: number) => {
    const { data } = await http.patch<Factura>(`/Facturas/${id}/anular`, {});
    return data;
  },

  facturaHtmlUrl: (id: number) => {
    return `http://localhost:5000/api/Facturas/${id}/html`;
  },
};
