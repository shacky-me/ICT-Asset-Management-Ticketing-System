"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useState } from "react";
import { updateAssetStatus } from "@/lib/apiClient";
import { addNotification } from "@/lib/notifications";
import { publishAssetsChanged } from "@/lib/assets";

type AssetDetail = {
  id: number;
  tag: string;
  name: string;
  category: string;
  make: string;
  model: string;
  serial: string;
  status: string;
  department: string;
  warranty: string;
};

type Props = {
  asset: AssetDetail | null;
  onClose: () => void;
};

export default function AssetDetailsModal({ asset, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "InStore" | "Maintenance" | "Flagged"
  >("InStore");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  if (!asset) return null;

  // Map display status to database status for editing
  const statusMap: Record<string, "InStore" | "Maintenance" | "Flagged"> = {
    "In Store": "InStore",
    Maintenance: "Maintenance",
    Flagged: "Flagged",
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setNewStatus(statusMap[asset.status] || "InStore");
    setErrorText("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorText("");
  };

  const handleSave = async () => {
    setErrorText("");
    setIsSubmitting(true);

    try {
      await updateAssetStatus(asset.id, newStatus);

      addNotification({
        title: "Asset status updated",
        message: `Asset status changed to ${
          newStatus === "InStore"
            ? "In Store"
            : newStatus === "Maintenance"
              ? "Maintenance"
              : "Flagged"
        }`,
        type: "asset",
      });

      publishAssetsChanged();
      setIsEditing(false);
      onClose();
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Unable to update asset status right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Asset Details
            </h3>
            <p className="text-xs text-slate-500">{asset.tag}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <Row label="Name" value={asset.name} />
          <Row label="Category" value={asset.category} />
          <Row label="Make" value={asset.make} />
          <Row label="Model" value={asset.model} />
          <Row label="Serial No." value={asset.serial} />

          {isEditing ? (
            <div className="grid grid-cols-3 gap-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Status
              </p>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value as "InStore" | "Maintenance" | "Flagged",
                  )
                }
                className="col-span-2 h-8 rounded border border-gray-200 bg-white px-2 text-sm font-semibold text-slate-800"
              >
                <option value="InStore">In Store</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>
          ) : (
            <Row label="Status" value={asset.status} />
          )}

          <Row label="Department" value={asset.department} />
          <Row label="Warranty" value={asset.warranty} />

          {errorText && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-2">
              {errorText}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Edit Status
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="col-span-2 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
