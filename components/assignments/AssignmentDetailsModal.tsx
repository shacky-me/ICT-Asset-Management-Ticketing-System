"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AssignmentRecord } from "@/lib/assignments";

type Props = {
  assignment: AssignmentRecord | null;
  onClose: () => void;
};

export default function AssignmentDetailsModal({ assignment, onClose }: Props) {
  if (!assignment) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assignment Details
            </h3>
            <p className="text-xs text-slate-500">
              Reference: {assignment.ref}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Asset Tag
              </p>
              <p className="font-semibold text-slate-800">
                {assignment.assetTag}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Status
              </p>
              <p className="font-semibold text-slate-800">
                {assignment.status}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Asset Name
            </p>
            <p className="font-semibold text-slate-800">
              {assignment.assetName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Assigned To
              </p>
              <p className="font-semibold text-slate-800">
                {assignment.assignedTo}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Date Issued
              </p>
              <p className="font-semibold text-slate-800">
                {assignment.dateIssued}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Department
            </p>
            <p className="font-semibold text-slate-800">
              {assignment.department}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
