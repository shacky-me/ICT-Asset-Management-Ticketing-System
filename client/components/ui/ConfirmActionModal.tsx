"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close confirmation dialog"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">{message}</p>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Removing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
