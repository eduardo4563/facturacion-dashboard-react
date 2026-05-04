export type Cliente = {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
};

export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
};

export type FacturaDetalleRequest = {
  productoId: number;
  cantidad: number;
};

export type FacturaDetalle = {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  producto?: Producto;
};

export type Factura = {
  id: number;
  serie: string;
  numero: number;
  clienteId: number;
  fecha: string;
  subTotal: number;
  igv: number;
  total: number;
  anulada: boolean;
  fechaAnulacion?: string;
  detalles: FacturaDetalle[];
  cliente?: Cliente;
};

export type LoginResponse = { token: string };

export type DashboardResumen = {
  totalVentas: number;
  facturas: number;
  facturasAnuladas: number;
  clientes: number;
  productos: number;
  bajoStock: number;
  sinStock: number;
  ventasMesActual: number;
  ventasMesAnterior: number;
};

export type VentaMensual = {
  mes: string;
  total: number;
  cantidad: number;
};

export type TopCliente = {
  clienteId: number;
  nombre: string;
  totalComprado: number;
  cantidadFacturas: number;
};
