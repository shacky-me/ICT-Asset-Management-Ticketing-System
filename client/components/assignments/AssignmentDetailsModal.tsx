"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Edit2, Trash2 } from "lucide-react";
import { deleteAssignment } from "@/lib/apiClient";
import { addNotification } from "@/lib/notifications";
import { AssignmentRecord } from "@/lib/assignments";

type Props = {
  assignment: AssignmentRecord | null;
  onClose: () => void;
  onEdit?: (assignment: AssignmentRecord) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export default function AssignmentDetailsModal({
  assignment,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}: Props) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!assignment) return null;

  const handleDeleteClick = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAssignment(assignment.id);

      addNotification({
        title: "Assignment removed",
        message: `Assignment ${assignment.ref} has been removed.`,
        type: "asset",
      });

      onClose();
      onDelete?.();
    } catch (error) {
      addNotification({
        title: "Error",
        message: "Could not remove assignment. Try again.",
        type: "system",
      });
    } finally {
      setDeleteLoading(false);
      setIsConfirmingDelete(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
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
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
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
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  assignment.status === "Assigned"
                    ? "bg-blue-100 text-blue-700"
                    : assignment.status === "Returned"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {assignment.status}
              </span>
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

        {isConfirmingDelete && (
          <div className="bg-red-50 border-t border-red-200 px-5 py-4">
            <p className="text-sm text-red-900 font-semibold mb-3">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-red-300 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleteLoading ? "Removing..." : "Confirm Remove"}
              </button>
            </div>
          </div>
        )}

        <div
          className={`border-t px-5 py-4 flex items-center justify-end gap-3 ${isConfirmingDelete ? "bg-slate-50" : "bg-slate-50"}`}
        >
          {!isConfirmingDelete && (
            <>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onEdit?.(assignment)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
