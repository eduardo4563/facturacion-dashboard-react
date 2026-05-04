import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  FileText,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Cliente, DashboardResumen, Factura, Producto, TopCliente, VentaMensual } from "../types";
import { dashboardApi } from "../api/services";
import { money } from "../utils/format";
import { CardSkeleton } from "../components/Skeleton";

export function Dashboard({
  clientes,
  productos,
  facturas,
}: {
  clientes: Cliente[];
  productos: Producto[];
  facturas: Factura[];
}) {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.resumen(),
      dashboardApi.ventasMensuales(),
      dashboardApi.topClientes(),
    ])
      .then(([r, v, t]) => {
        setResumen(r);
        setVentasMensuales(v);
        setTopClientes(t);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [facturas]);

  const tendencia =
    resumen &&
    resumen.ventasMesAnterior > 0
      ? (((resumen.ventasMesActual - resumen.ventasMesAnterior) /
          resumen.ventasMesAnterior) *
          100).toFixed(1)
      : null;

  const facturasActivas = facturas.filter((f) => !f.anulada);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Panel gerencial
          </p>
          <h1 className="mt-3 text-4xl font-black lg:text-5xl">
            Sistema Empresarial de Facturación
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Controla ventas, clientes, productos, stock y comprobantes desde una
            interfaz moderna conectada a una API .NET protegida con JWT.
          </p>

          {tendencia && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              {Number(tendencia) >= 0 ? (
                <TrendingUp size={16} className="text-emerald-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
              <span>
                {Number(tendencia) >= 0 ? "+" : ""}
                {tendencia}% vs mes anterior
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="card bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
            <TrendingUp />
            <p className="mt-4 text-sm opacity-80">Ventas totales</p>
            <h3 className="text-3xl font-black">
              {money(resumen?.totalVentas ?? 0)}
            </h3>
            {resumen?.ventasMesActual !== undefined && (
              <p className="mt-2 text-xs opacity-70">
                Este mes: {money(resumen.ventasMesActual)}
              </p>
            )}
          </div>

          <div className="card">
            <FileText className="text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Facturas activas</p>
            <h3 className="text-3xl font-black">
              {resumen?.facturas ?? facturasActivas.length}
            </h3>
            {(resumen?.facturasAnuladas ?? 0) > 0 && (
              <p className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1">
                <Ban size={12} /> {resumen?.facturasAnuladas} anuladas
              </p>
            )}
          </div>

          <div className="card">
            <Users className="text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Clientes</p>
            <h3 className="text-3xl font-black">
              {resumen?.clientes ?? clientes.length}
            </h3>
          </div>

          <div className="card">
            <Package className="text-violet-600" />
            <p className="mt-4 text-sm text-slate-500">Productos</p>
            <h3 className="text-3xl font-black">
              {resumen?.productos ?? productos.length}
            </h3>
          </div>

          <div className={`card ${(resumen?.bajoStock ?? 0) > 0 ? "border-red-200 bg-red-50" : ""}`}>
            <AlertTriangle className={`${(resumen?.bajoStock ?? 0) > 0 ? "text-red-600" : "text-slate-400"}`} />
            <p className="mt-4 text-sm text-slate-500">Bajo stock (≤5)</p>
            <h3 className={`text-3xl font-black ${(resumen?.bajoStock ?? 0) > 0 ? "text-red-700" : ""}`}>
              {resumen?.bajoStock ?? 0}
            </h3>
            {(resumen?.sinStock ?? 0) > 0 && (
              <p className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1">
                <XCircle size={12} /> {resumen?.sinStock} sin stock
              </p>
            )}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Area chart - ventas mensuales */}
        <div className="card xl:col-span-2">
          <h3 className="text-xl font-black text-slate-950">
            Ventas últimos 6 meses
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Evolución mensual de ingresos totales.
          </p>

          <div className="mt-6 h-72">
            {ventasMensuales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasMensuales}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" fontSize={11} tick={{ fill: "#94a3b8" }} />
                  <YAxis fontSize={11} tick={{ fill: "#94a3b8" }} />
                  <Tooltip
                    formatter={(value) => [money(Number(value)), "Ventas"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorVentas)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
                Emite facturas para ver la evolución.
              </div>
            )}
          </div>
        </div>

        {/* Top clientes */}
        <div className="card">
          <h3 className="text-xl font-black text-slate-950">Top clientes</h3>
          <p className="mt-1 text-sm text-slate-500">Por monto total comprado.</p>

          <div className="mt-5 space-y-3">
            {topClientes.length ? (
              topClientes.map((c, i) => (
                <div key={c.clienteId} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.cantidadFacturas} factura{c.cantidadFacturas !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    {money(c.totalComprado)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-400">
                Sin datos aún.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comprobantes recientes + stock bajo */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Últimas facturas */}
        <div className="card">
          <h3 className="text-xl font-black text-slate-950">Últimas facturas</h3>
          <div className="mt-4 h-64">
            {facturasActivas.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facturasActivas.slice(0, 6).reverse().map((f) => ({
                  name: `${f.serie}-${String(f.numero).padStart(4, "0")}`,
                  total: Number(f.total),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} tick={{ fill: "#94a3b8" }} />
                  <YAxis fontSize={10} tick={{ fill: "#94a3b8" }} />
                  <Tooltip
                    formatter={(v) => [money(Number(v)), "Total"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
                Emite una factura para ver el gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="card">
          <h3 className="text-xl font-black text-slate-950">Estado del sistema</h3>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600 font-bold">🟢 Backend API</p>
              <p className="mt-1 text-lg font-black text-emerald-800">Conectado</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 font-bold">🔐 Seguridad</p>
              <p className="mt-1 text-lg font-black text-slate-950">JWT Activo</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs text-violet-600 font-bold">🗄️ Base de datos</p>
              <p className="mt-1 text-lg font-black text-violet-800">SQLite</p>
            </div>
            {(resumen?.bajoStock ?? 0) > 0 && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                <p className="text-xs text-red-600 font-bold">⚠️ Alerta de stock</p>
                <p className="mt-1 text-lg font-black text-red-800">
                  {resumen?.bajoStock} productos con stock bajo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
