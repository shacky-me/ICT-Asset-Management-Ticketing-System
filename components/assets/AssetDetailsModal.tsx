"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

type AssetDetail = {
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
  if (!asset) return null;

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
          <Row label="Status" value={asset.status} />
          <Row label="Department" value={asset.department} />
          <Row label="Warranty" value={asset.warranty} />
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
