"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { addNotification } from "@/lib/notifications";
import { useAssets } from "@/lib/assets";
import { publishAssetsChanged } from "@/lib/assets";
import {
  createAssignment,
  updateAssignment,
  updateAssignmentStatus,
} from "@/lib/apiClient";
import { publishAssignmentsChanged } from "@/lib/assignmentEvents";
import type { AssignmentRecord } from "@/lib/assignments";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingAssignment?: AssignmentRecord | null;
  onRefresh?: () => void;
}

export default function AssignmentModal({
  isOpen,
  onClose,
  editingAssignment,
  onRefresh,
}: Props) {
  const { assets } = useAssets();
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [payRollNo, setPayRollNo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "RETURNED" | "OVERDUE">(
    "ACTIVE",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Reset form when modal opens/closes
  const isEditing = !!editingAssignment;
  const modalKey = isEditing ? editingAssignment?.ref : "create";

  useMemo(() => {
    if (!isOpen) {
      setSelectedAssetId("");
      setAssignedTo("");
      setPayRollNo("");
      setDepartmentId("");
      setStatus("ACTIVE");
      setErrorText("");
    } else if (isEditing && editingAssignment) {
      setAssignedTo(editingAssignment.assignedTo);
      setPayRollNo("");
      setDepartmentId("");
      // Map display status to database status
      const statusMap: Record<string, "ACTIVE" | "RETURNED" | "OVERDUE"> = {
        Assigned: "ACTIVE",
        Returned: "RETURNED",
        Overdue: "OVERDUE",
      };
      setStatus(statusMap[editingAssignment.status] || "ACTIVE");
    }
  }, [isOpen, isEditing, editingAssignment, modalKey]);

  const departmentOptions = useMemo(() => {
    const seen = new Set<number>();
    return assets
      .filter((asset) => {
        const deptId = asset.departmentId;
        if (!deptId || seen.has(deptId)) return false;
        seen.add(deptId);
        return true;
      })
      .map((asset) => ({
        label: asset.department,
        value: String(asset.departmentId),
      }));
  }, [assets]);

  const selectedAsset = assets.find(
    (item) => String(item.id) === selectedAssetId,
  );

  async function handleSubmit() {
    setErrorText("");

    if (isEditing) {
      if (!assignedTo.trim()) {
        setErrorText("Staff name is required.");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload: any = {
          assignedTo: assignedTo.trim(),
        };
        if (payRollNo.trim()) payload.payRollNo = payRollNo.trim();
        if (departmentId) payload.departmentId = Number(departmentId);

        await updateAssignment(editingAssignment!.id, payload);

        // Update status if it changed
        const currentStatus =
          editingAssignment?.status === "Assigned"
            ? "ACTIVE"
            : editingAssignment?.status === "Returned"
              ? "RETURNED"
              : "OVERDUE";

        if (status !== currentStatus) {
          await updateAssignmentStatus(editingAssignment!.id, status);
        }

        addNotification({
          title: "Assignment updated",
          message: `Assignment updated successfully.`,
          type: "asset",
        });

        publishAssignmentsChanged();
        publishAssetsChanged();
        onRefresh?.();
        onClose();
      } catch (error) {
        setErrorText(
          error instanceof Error
            ? error.message
            : "Unable to update assignment right now.",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (
        !selectedAssetId ||
        !assignedTo.trim() ||
        !payRollNo.trim() ||
        !departmentId
      ) {
        setErrorText("All fields are required.");
        return;
      }

      setIsSubmitting(true);
      try {
        await createAssignment({
          assetId: Number(selectedAssetId),
          assignedTo: assignedTo.trim(),
          payRollNo: payRollNo.trim(),
          dateOfAssignment: new Date().toISOString(),
          departmentId: Number(departmentId),
        });

        addNotification({
          title: "Assignment created",
          message: `${selectedAsset?.name || "Asset"} assigned to ${assignedTo.trim()}.`,
          type: "asset",
        });

        publishAssignmentsChanged();
        publishAssetsChanged();
        onRefresh?.();
        onClose();
        setSelectedAssetId("");
        setAssignedTo("");
        setPayRollNo("");
        setDepartmentId("");
      } catch (error) {
        setErrorText(
          error instanceof Error
            ? error.message
            : "Unable to create assignment right now.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? "Edit Assignment" : "New Assignment"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? `Update details for ${editingAssignment?.ref}`
                : "Assign an available device through the backend workflow."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isEditing && (
            <div>
              <label className="text-xs text-gray-500">Asset</label>
              <select
                value={selectedAssetId}
                onChange={(event) => setSelectedAssetId(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.tag} - {asset.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500">
              {isEditing ? "Staff Name" : "Assigned To"}
            </label>
            <input
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              placeholder="Staff full name"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="text-xs text-gray-500">Payroll Number</label>
              <input
                value={payRollNo}
                onChange={(event) => setPayRollNo(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
                placeholder="Payroll/Staff number"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500">Department</label>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="">Select department</option>
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isEditing && (
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as "ACTIVE" | "RETURNED" | "OVERDUE",
                  )
                }
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="ACTIVE">Assigned</option>
                <option value="RETURNED">Returned</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          )}

          {errorText && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorText}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Assigning..."
              : isEditing
                ? "Update"
                : "Assign Device"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
