import { AlertTriangle, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { productosApi } from "../api/services";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Producto } from "../types";
import { money } from "../utils/format";

interface EditForm {
  nombre: string;
  precio: string;
  stock: string;
}

export function Productos({
  productos,
  onReload,
}: {
  productos: Producto[];
  onReload: () => Promise<void>;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    precio: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"todos" | "bajo" | "sinStock">("todos");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ nombre: "", precio: "", stock: "" });
  const [editing, setEditing] = useState(false);

  const filtered = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchStock =
      stockFilter === "todos"
        ? true
        : stockFilter === "bajo"
        ? p.stock > 0 && p.stock <= 5
        : p.stock === 0;
    return matchSearch && matchStock;
  });

  const bajoStock = productos.filter((p) => p.stock <= 5 && p.stock > 0).length;
  const sinStock = productos.filter((p) => p.stock === 0).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("El nombre del producto es obligatorio.");
      return;
    }
    if (Number(form.precio) <= 0) {
      toast.error("El precio debe ser mayor a cero.");
      return;
    }
    setLoading(true);
    try {
      await productosApi.crear({
        codigo: form.codigo,
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock),
      });
      setForm({ codigo: "", nombre: "", precio: "", stock: "" });
      await onReload();
      toast.success("Producto creado correctamente.");
    } catch {
      toast.error("No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(p: Producto) {
    setEditProduct(p);
    setEditForm({
      nombre: p.nombre,
      precio: String(p.precio),
      stock: String(p.stock),
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    setEditing(true);
    try {
      await productosApi.actualizar(editProduct.id, {
        nombre: editForm.nombre,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
      });
      await onReload();
      setEditProduct(null);
      toast.success("Producto actualizado.");
    } catch {
      toast.error("No se pudo actualizar el producto.");
    } finally {
      setEditing(false);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await productosApi.eliminar(deleteId);
      await onReload();
      toast.success("Producto eliminado.");
    } catch {
      toast.error("No se pudo eliminar el producto.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function stockBadge(stock: number) {
    if (stock === 0)
      return <span className="status-danger">Sin stock</span>;
    if (stock <= 5)
      return <span className="status-warning flex items-center gap-1"><AlertTriangle size={11} />Bajo: {stock}</span>;
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Stock: {stock}</span>;
  }

  return (
    <>
      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar producto"
        message="¿Seguro que quieres eliminar este producto? Esta acción es irreversible."
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />

      {/* Edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setEditProduct(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-scale-in">
            <button
              onClick={() => setEditProduct(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                <Package size={20} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Editar producto</h3>
                <p className="text-xs text-emerald-700 font-bold">{editProduct.codigo}</p>
              </div>
            </div>

            <form onSubmit={saveEdit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Nombre *
                </label>
                <input
                  className="input"
                  value={editForm.nombre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Precio (S/)
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editForm.precio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Stock
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button disabled={editing} className="btn-primary flex-1">
                  {editing ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <div className="card">
          <div className="mb-6 rounded-3xl bg-slate-950 p-5 text-white">
            <Package className="text-violet-300" />
            <h2 className="mt-3 text-2xl font-black">Nuevo producto</h2>
            <p className="mt-2 text-sm text-slate-300">
              Agrega servicios o productos a tu catálogo.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Código
              </label>
              <input
                className="input"
                placeholder="PROD-001"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Nombre *
              </label>
              <input
                className="input"
                placeholder="Servicio de consultoría"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Precio *
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Stock
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>

            <button disabled={loading} className="btn-primary w-full">
              <Plus size={18} />
              {loading ? "Guardando..." : "Crear producto"}
            </button>
          </form>

          {/* Stock alerts summary */}
          {(bajoStock > 0 || sinStock > 0) && (
            <div className="mt-6 space-y-2">
              {sinStock > 0 && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    {sinStock} producto{sinStock !== 1 ? "s" : ""} sin stock
                  </p>
                </div>
              )}
              {bajoStock > 0 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <p className="text-xs font-bold text-amber-700">
                    {bajoStock} producto{bajoStock !== 1 ? "s" : ""} con stock bajo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* List */}
        <div className="card xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black gradient-title">
                Catálogo de productos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Administra precios y disponibilidad.
              </p>
            </div>
            <span className="badge">{filtered.length} productos</span>
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
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["todos", "bajo", "sinStock"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    stockFilter === f
                      ? "bg-white shadow text-slate-950"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "bajo" ? "⚠️ Bajo" : "❌ Sin stock"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md group ${
                  p.stock === 0
                    ? "border-red-200 bg-red-50/50"
                    : p.stock <= 5
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-700 font-mono">
                      {p.codigo}
                    </p>
                    <h3 className="mt-1 font-black text-slate-900 truncate">
                      {p.nombre}
                    </h3>
                  </div>
                  {stockBadge(p.stock)}
                </div>

                <p className="mt-3 text-2xl font-black text-slate-950">
                  {money(Number(p.precio))}
                </p>

                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}

            {!filtered.length && (
              <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <Package size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">
                  {search || stockFilter !== "todos"
                    ? "Sin resultados para tu búsqueda."
                    : "No hay productos en el catálogo."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
