import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition"
        >
          <X size={18} />
        </button>

        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${danger ? "bg-red-100" : "bg-amber-100"}`}>
          <AlertTriangle size={24} className={danger ? "text-red-600" : "text-amber-600"} />
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>

        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white transition ${danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
