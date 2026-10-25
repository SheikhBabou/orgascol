"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Supprimer",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-overlay-in">
      <div className="bg-card-bg border border-border rounded-xl w-full max-w-sm p-6 space-y-4 animate-fade-in-scale">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-danger/10">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-background transition-colors btn-press"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors btn-press"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
