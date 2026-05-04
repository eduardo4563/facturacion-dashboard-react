import { Plus, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { clientesApi } from "../api/services";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Cliente } from "../types";

export function Clientes({
  clientes,
  onReload,
}: {
  clientes: Cliente[];
  onReload: () => Promise<void>;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.documento.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.documento.trim()) {
      toast.error("Nombre y documento son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await clientesApi.crear(form);
      setForm({ nombre: "", documento: "", email: "", telefono: "" });
      await onReload();
      toast.success("Cliente creado correctamente.");
    } catch {
      toast.error("No se pudo crear el cliente. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await clientesApi.eliminar(deleteId);
      await onReload();
      toast.success("Cliente eliminado.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "No se puede eliminar este cliente. Tiene facturas activas."
      );
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar cliente"
        message="¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer."
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <div className="card">
          <div className="mb-6 rounded-3xl bg-slate-950 p-5 text-white">
            <User className="text-blue-300" />
            <h2 className="mt-3 text-2xl font-black">Nuevo cliente</h2>
            <p className="mt-2 text-sm text-slate-300">
              Registra clientes para emitir comprobantes.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Nombre / Razón social *
              </label>
              <input
                className="input"
                placeholder="Empresa SAC"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                RUC / DNI *
              </label>
              <input
                className="input"
                placeholder="20600000001"
                value={form.documento}
                onChange={(e) =>
                  setForm({ ...form, documento: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Correo electrónico
              </label>
              <input
                className="input"
                type="email"
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Teléfono
              </label>
              <input
                className="input"
                placeholder="999 999 999"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />
            </div>

            <button disabled={loading} className="btn-primary w-full">
              <Plus size={18} />
              {loading ? "Guardando..." : "Crear cliente"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="card xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black gradient-title">
                Clientes registrados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Gestiona tu cartera de clientes.
              </p>
            </div>
            <span className="badge">{filtered.length} clientes</span>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              placeholder="Buscar por nombre, documento o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3 pr-4 font-bold">Nombre</th>
                  <th className="pr-4 font-bold">Documento</th>
                  <th className="pr-4 font-bold hidden md:table-cell">Email</th>
                  <th className="pr-4 font-bold hidden lg:table-cell">Teléfono</th>
                  <th className="font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="table-row group"
                  >
                    <td className="py-4 pr-4 font-black text-slate-900">
                      {c.nombre}
                    </td>
                    <td className="pr-4 font-mono text-slate-600 text-xs">
                      {c.documento}
                    </td>
                    <td className="pr-4 text-slate-600 hidden md:table-cell">
                      {c.email || "—"}
                    </td>
                    <td className="pr-4 text-slate-600 hidden lg:table-cell">
                      {c.telefono || "—"}
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="rounded-xl p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition"
                        title="Eliminar cliente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <p className="py-10 text-center text-sm font-bold text-slate-400">
                {search ? "Sin resultados para tu búsqueda." : "No hay clientes registrados."}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
