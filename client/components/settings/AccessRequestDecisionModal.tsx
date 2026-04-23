"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AccessRequestDecisionModalProps = {
  isOpen: boolean;
  action: "approve" | "reject";
  applicantName: string;
  applicantEmail: string;
  reason: string;
  isLoading?: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AccessRequestDecisionModal({
  isOpen,
  action,
  applicantName,
  applicantEmail,
  reason,
  isLoading = false,
  onReasonChange,
  onClose,
  onConfirm,
}: AccessRequestDecisionModalProps) {
  if (!isOpen) return null;

  const isReject = action === "reject";

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isReject ? "Reject Access Request" : "Approve Access Request"}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close decision dialog"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-slate-700">
            {isReject
              ? `You are about to reject ${applicantName}'s access request.`
              : `You are about to approve ${applicantName}'s access request.`}
          </p>
          <p className="text-xs text-slate-500">{applicantEmail}</p>

          {isReject && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Rejection reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                placeholder="Add a short reason for the applicant"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                rows={4}
              />
            </div>
          )}
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
            className={
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#235FE7] hover:bg-[#1a4fd6]"
            }
          >
            {isLoading
              ? isReject
                ? "Rejecting..."
                : "Approving..."
              : isReject
                ? "Confirm Reject"
                : "Confirm Approve"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
