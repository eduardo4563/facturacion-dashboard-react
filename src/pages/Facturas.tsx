import { Ban, ChevronDown, ChevronUp, ExternalLink, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { facturasApi } from "../api/services";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Cliente, Factura, Producto } from "../types";
import { date, money } from "../utils/format";

export function Facturas({
  clientes,
  productos,
  facturas,
  onReload,
}: {
  clientes: Cliente[];
  productos: Producto[];
  facturas: Factura[];
  onReload: () => Promise<void>;
}) {
  const toast = useToast();
  const [clienteId, setClienteId] = useState<number>(clientes[0]?.id || 1);
  const [detalles, setDetalles] = useState([
    { productoId: productos[0]?.id || 1, cantidad: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todas" | "activas" | "anuladas">("todas");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [anularId, setAnularId] = useState<number | null>(null);
  const [anulando, setAnulando] = useState(false);

  const filtered = facturas.filter((f) => {
    const numero = `${f.serie}-${String(f.numero).padStart(6, "0")}`;
    const matchSearch =
      numero.includes(search) ||
      (f.cliente?.nombre ?? "").toLowerCase().includes(search.toLowerCase());
    const matchEstado =
      filterEstado === "todas"
        ? true
        : filterEstado === "activas"
        ? !f.anulada
        : f.anulada;
    return matchSearch && matchEstado;
  });

  const totalFiltrado = filtered
    .filter((f) => !f.anulada)
    .reduce((sum, f) => sum + Number(f.total), 0);

  function addItem() {
    setDetalles([
      ...detalles,
      { productoId: productos[0]?.id || 1, cantidad: 1 },
    ]);
  }

  function removeItem(index: number) {
    setDetalles(detalles.filter((_, i) => i !== index));
  }

  // Preview total
  const previewTotal = detalles.reduce((sum, d) => {
    const p = productos.find((pr) => pr.id === d.productoId);
    return sum + (p ? p.precio * d.cantidad : 0);
  }, 0);

  async function emitir(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await facturasApi.emitir(clienteId, detalles);
      setDetalles([{ productoId: productos[0]?.id || 1, cantidad: 1 }]);
      await onReload();
      toast.success("Factura emitida exitosamente.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "No se pudo emitir la factura. Revisa stock y datos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmarAnular() {
    if (anularId === null) return;
    setAnulando(true);
    try {
      await facturasApi.anular(anularId);
      await onReload();
      toast.warning("Factura anulada. El stock fue restaurado.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "No se pudo anular la factura."
      );
    } finally {
      setAnulando(false);
      setAnularId(null);
    }
  }

  async function verFactura(id: number) {
    const ventana = window.open("", "_blank");

    if (!ventana) {
      toast.error(
        "El navegador bloqueó la nueva ventana. Permite ventanas emergentes para ver la factura."
      );
      return;
    }

    ventana.document.write(
      "<p style=\"font-family:Arial,sans-serif;padding:24px\">Cargando factura...</p>"
    );

    try {
      const html = await facturasApi.obtenerHtml(id);

      ventana.document.open();
      ventana.document.write(html);
      ventana.document.close();
    } catch (err: any) {
      ventana.close();
      toast.error(
        err?.response?.data?.message || "No se pudo abrir la factura."
      );
    }
  }

  return (
    <>
      <ConfirmDialog
        open={anularId !== null}
        title="Anular factura"
        message="¿Seguro que quieres anular este comprobante? El stock de los productos será restaurado automáticamente."
        confirmLabel={anulando ? "Anulando..." : "Anular factura"}
        onConfirm={confirmarAnular}
        onCancel={() => setAnularId(null)}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Emit form */}
        <div className="card">
          <div className="mb-6 rounded-3xl bg-slate-950 p-5 text-white">
            <Receipt className="text-emerald-300" />
            <h2 className="mt-3 text-2xl font-black">Emitir factura</h2>
            <p className="mt-2 text-sm text-slate-300">
              Genera comprobantes con IGV 18% automático.
            </p>
          </div>

          <form onSubmit={emitir} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Cliente
              </label>
              <select
                className="input"
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">
                Productos
              </label>
              {detalles.map((d, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <select
                    className="input"
                    value={d.productoId}
                    onChange={(e) => {
                      const copy = [...detalles];
                      copy[index].productoId = Number(e.target.value);
                      setDetalles(copy);
                    }}
                  >
                    {productos.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.nombre} — {money(p.precio)}{p.stock === 0 ? " (sin stock)" : ` — Stock: ${p.stock}`}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 flex gap-2">
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={d.cantidad}
                      onChange={(e) => {
                        const copy = [...detalles];
                        copy[index].cantidad = Number(e.target.value);
                        setDetalles(copy);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-secondary px-3"
                      disabled={detalles.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="btn-secondary w-full"
            >
              <Plus size={18} />
              Agregar producto
            </button>

            {/* Preview */}
            {previewTotal > 0 && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>{money(previewTotal / 1.18)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>IGV 18%</span>
                  <span>{money(previewTotal - previewTotal / 1.18)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-800 border-t border-emerald-200 pt-1.5">
                  <span>Total estimado</span>
                  <span>{money(previewTotal)}</span>
                </div>
              </div>
            )}

            <button disabled={loading || clientes.length === 0} className="btn-primary w-full">
              {loading ? "Emitiendo..." : "Emitir comprobante"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="card xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black gradient-title">
                Facturas emitidas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Historial de comprobantes generados.
              </p>
            </div>
            <div className="text-right">
              <span className="badge">{filtered.length} registros</span>
              {totalFiltrado > 0 && (
                <p className="mt-1 text-xs font-bold text-emerald-700">
                  Total activo: {money(totalFiltrado)}
                </p>
              )}
            </div>
          </div>

          {/* Search + filters */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-40">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="input pl-9"
                placeholder="Buscar por número o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["todas", "activas", "anuladas"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterEstado(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition capitalize ${
                    filterEstado === f
                      ? "bg-white shadow text-slate-950"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filtered.map((f) => {
              const numero = `${f.serie}-${String(f.numero).padStart(6, "0")}`;
              const isExpanded = expandedId === f.id;

              return (
                <div
                  key={f.id}
                  className={`rounded-3xl border p-5 transition hover:shadow-lg ${
                    f.anulada
                      ? "border-red-200 bg-red-50/40 opacity-75"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      {f.anulada ? (
                        <span className="status-danger flex items-center gap-1">
                          <Ban size={11} /> ANULADA
                        </span>
                      ) : (
                        <span className="status-ok">EMITIDA</span>
                      )}
                      <p className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-700">
                        {numero}
                      </p>
                      <h3 className="mt-1 text-xl font-black">
                        {f.cliente?.nombre || `Cliente #${f.clienteId}`}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {date(f.fecha)}
                      </p>
                      {f.anulada && f.fechaAnulacion && (
                        <p className="mt-1 text-xs text-red-500 font-bold">
                          Anulada: {date(f.fechaAnulacion)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">Total</p>
                      <p className={`text-3xl font-black ${f.anulada ? "line-through text-slate-400" : "text-slate-950"}`}>
                        {money(f.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500">Subtotal</p>
                      <p className="font-black">{money(f.subTotal)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500">IGV 18%</p>
                      <p className="font-black">{money(f.igv)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 ${f.anulada ? "bg-red-100" : "bg-emerald-50"}`}>
                      <p className={`text-xs font-bold ${f.anulada ? "text-red-600" : "text-emerald-700"}`}>
                        Estado
                      </p>
                      <p className={`font-black ${f.anulada ? "text-red-700" : "text-emerald-800"}`}>
                        {f.anulada ? "Anulada" : "Vigente"}
                      </p>
                    </div>
                  </div>

                  {/* Detalles accordion */}
                  {f.detalles?.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : f.id)
                        }
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                        {isExpanded ? "Ocultar" : "Ver"} {f.detalles.length} línea
                        {f.detalles.length !== 1 ? "s" : ""} de detalle
                      </button>

                      {isExpanded && (
                        <div className="mt-3 rounded-2xl border border-slate-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500">
                                <th className="py-2 px-3 text-left font-bold">Producto</th>
                                <th className="py-2 px-3 text-right font-bold">Cant.</th>
                                <th className="py-2 px-3 text-right font-bold">P. Unit.</th>
                                <th className="py-2 px-3 text-right font-bold">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {f.detalles.map((d) => (
                                <tr key={d.id} className="border-t border-slate-100">
                                  <td className="py-2 px-3 font-bold text-slate-800">
                                    {d.producto?.nombre || `#${d.productoId}`}
                                  </td>
                                  <td className="py-2 px-3 text-right text-slate-600">
                                    {d.cantidad}
                                  </td>
                                  <td className="py-2 px-3 text-right text-slate-600">
                                    {money(d.precioUnitario)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-black text-slate-900">
                                    {money(d.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => verFactura(f.id)}
                      className="btn-primary"
                    >
                      <ExternalLink size={16} />
                      Ver factura
                    </button>

                    {!f.anulada && (
                      <button
                        onClick={() => setAnularId(f.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                      >
                        <Ban size={16} />
                        Anular
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!filtered.length && (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <Receipt size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">
                  {search || filterEstado !== "todas"
                    ? "Sin resultados para tu búsqueda."
                    : "Aún no hay facturas emitidas."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
