"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserAccountRemovalModalProps = {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function UserAccountRemovalModal({
  isOpen,
  userName,
  userEmail,
  isLoading = false,
  onClose,
  onConfirm,
}: UserAccountRemovalModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Remove User Account
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close remove account dialog"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5" />
            <p className="text-xs text-amber-800 leading-5">
              This will deactivate the user account and remove it from active
              users in the system.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Removing..." : "Confirm Remove"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
