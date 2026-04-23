"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RoleCode = "END_USER" | "SUPERVISOR" | "ICT_OFFICER" | "ICT_ADMIN";

type UserRoleChangeModalProps = {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  currentRoleLabel: string;
  selectedRole: RoleCode;
  isLoading?: boolean;
  onRoleChange: (role: RoleCode) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const ROLE_OPTIONS: Array<{ value: RoleCode; label: string }> = [
  { value: "END_USER", label: "End User" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "ICT_OFFICER", label: "ICT Officer" },
  { value: "ICT_ADMIN", label: "ICT Administrator" },
];

export default function UserRoleChangeModal({
  isOpen,
  userName,
  userEmail,
  currentRoleLabel,
  selectedRole,
  isLoading = false,
  onRoleChange,
  onClose,
  onConfirm,
}: UserRoleChangeModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Change User Role</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close role dialog"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
            <p className="text-xs text-slate-500">Current Role</p>
            <p className="text-sm font-medium text-slate-900">
              {currentRoleLabel}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(event) => onRoleChange(event.target.value as RoleCode)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            className="bg-[#235FE7] hover:bg-[#1a4fd6]"
          >
            {isLoading ? "Updating..." : "Confirm Role Change"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
