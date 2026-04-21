"use client";

import { useEffect, useMemo, useState } from "react";
import { getAssets, getAssetStats, type ApiAsset } from "@/lib/apiClient";

const ASSETS_CHANGED_EVENT = "ictams:assets-changed";

export type AssetRow = {
  id: number;
  tag: string;
  name: string;
  category: string;
  make: string;
  model: string;
  serial: string;
  status: "Assigned" | "In Store" | "Maintenance" | "Flagged";
  department: string;
  warranty: string;
  createdAt: string;
};

export type AssetStats = {
  total: number;
  assigned: number;
  inStore: number;
  maintenance: number;
};

function mapAssetStatus(raw: string): AssetRow["status"] {
  const value = (raw || "").toLowerCase();
  if (value === "assigned") return "Assigned";
  if (value === "instore" || value === "in store") return "In Store";
  if (value === "maintenance") return "Maintenance";
  return "Flagged";
}

function mapAsset(input: ApiAsset): AssetRow {
  return {
    id: input.id,
    tag: input.tagNo,
    name: `${input.make} ${input.model}`.trim(),
    category: input.category,
    make: input.make,
    model: input.model,
    serial: input.serialNumber,
    status: mapAssetStatus(input.status),
    department: input.department?.name || "Unassigned",
    warranty: "Unknown",
    createdAt: input.createdAt,
  };
}

export function publishAssetsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ASSETS_CHANGED_EVENT));
}

export function useAssets() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [stats, setStats] = useState<AssetStats>({
    total: 0,
    assigned: 0,
    inStore: 0,
    maintenance: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [assetsResponse, statsResponse] = await Promise.all([
          getAssets({ limit: 200 }),
          getAssetStats(),
        ]);

        if (cancelled) return;
        setAssets(assetsResponse.assets.map(mapAsset));
        setStats(statsResponse);
      } catch {
        if (!cancelled) {
          setAssets([]);
          setStats({ total: 0, assigned: 0, inStore: 0, maintenance: 0 });
        }
      }
    };

    load();

    const handleAssetsChanged = () => {
      load();
    };

    window.addEventListener(ASSETS_CHANGED_EVENT, handleAssetsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(ASSETS_CHANGED_EVENT, handleAssetsChanged);
    };
  }, []);

  const byDepartment = useMemo(() => {
    return assets.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.department] = (acc[asset.department] || 0) + 1;
      return acc;
    }, {});
  }, [assets]);

  return { assets, stats, byDepartment };
}
