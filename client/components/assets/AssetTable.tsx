"use client";

import { useMemo, useState } from "react";
import AssetDetailsModal from "@/components/assets/AssetDetailsModal";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import { deleteAsset } from "@/lib/apiClient";
import { publishAssetsChanged, type AssetRow } from "@/lib/assets";
import { addNotification } from "@/lib/notifications";

// Types
type AssetStatus = "Assigned" | "In Store" | "Maintenance" | "Flagged";

type Asset = AssetRow;

// Config
const PAGE_SIZE = 8;

// Style maps
const statusStyles: Record<AssetStatus, string> = {
  Assigned: "bg-green-100 text-green-700 border border-green-200",
  "In Store": "bg-blue-50 text-blue-600 border border-blue-200",
  Maintenance: "bg-orange-100 text-orange-600 border border-orange-200",
  Flagged: "bg-red-50 text-red-600 border border-red-200",
};
const statusDot: Record<AssetStatus, string> = {
  Assigned: "bg-green-500",
  "In Store": "bg-blue-500",
  Maintenance: "bg-orange-500",
  Flagged: "bg-red-500",
};
const warrantyStyles: Record<string, string> = {
  Active: "text-green-600",
  Expired: "text-red-500",
};

// Pagination helper
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

//  Props
interface Props {
  assets: Asset[];
  activeTab: string;
  search?: string;
  categoryFilter?: string;
  departmentFilter?: string;
  canRemoveAssets?: boolean;
}

//  Component
const AssetTable = ({
  assets,
  activeTab,
  search = "",
  categoryFilter = "All Categories",
  departmentFilter = "All Departments",
  canRemoveAssets = false,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);
  const [removedAssetIds, setRemovedAssetIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [assetPendingRemoval, setAssetPendingRemoval] = useState<Asset | null>(
    null,
  );

  const filtered = useMemo(
    () =>
      assets
        .filter((a) => !removedAssetIds.has(a.id))
        .filter((a) => activeTab === "All" || a.status === activeTab)
        .filter(
          (a) =>
            categoryFilter === "All Categories" ||
            a.category === categoryFilter,
        )
        .filter(
          (a) =>
            departmentFilter === "All Departments" ||
            a.department === departmentFilter,
        )
        .filter((a) => {
          const query = search.trim().toLowerCase();
          if (!query) return true;
          return (
            a.tag.toLowerCase().includes(query) ||
            a.name.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query) ||
            a.make.toLowerCase().includes(query) ||
            a.model.toLowerCase().includes(query) ||
            a.serial.toLowerCase().includes(query)
          );
        }),
    [
      activeTab,
      assets,
      categoryFilter,
      departmentFilter,
      removedAssetIds,
      search,
    ],
  );

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const pageNumbers = getPageNumbers(effectivePage, totalPages);

  const visibleRows = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filtered]);

  const startRecord =
    totalRecords === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(effectivePage * PAGE_SIZE, totalRecords);

  function goTo(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  async function confirmRemoveAsset() {
    if (!assetPendingRemoval) return;
    try {
      setDeletingAssetId(assetPendingRemoval.id);
      await deleteAsset(assetPendingRemoval.id);
      addNotification({
        title: "Asset removed",
        message: `${assetPendingRemoval.tag} was removed from the register.`,
        type: "asset",
      });
      setRemovedAssetIds((prev) => {
        const next = new Set(prev);
        next.add(assetPendingRemoval.id);
        return next;
      });
      publishAssetsChanged();
      setAssetPendingRemoval(null);
    } catch (error) {
      addNotification({
        title: "Unable to remove asset",
        message:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        type: "auth",
      });
    } finally {
      setDeletingAssetId(null);
    }
  }

  return (
    <>
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "Asset Tag",
              "Name",
              "Category",
              "Make",
              "Model",
              "Serial No.",
              "Status",
              "Assigned To",
              "Dept.",
              "Warranty",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-left text-xs font-semibold text-gray-500
                           uppercase tracking-wider whitespace-nowrap w-[10%]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {visibleRows.length > 0 ? (
            visibleRows.map((a) => (
              <tr
                key={a.tag}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-4 text-[#235FE7] font-semibold text-xs truncate">
                  {a.tag}
                </td>
                <td className="px-3 py-4 text-gray-900 font-medium text-xs truncate">
                  {a.name}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.category}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.make}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.model}
                </td>
                <td className="px-3 py-4 text-gray-400 font-mono text-xs truncate">
                  {a.serial}
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full
                                    text-xs font-semibold whitespace-nowrap ${statusStyles[a.status]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[a.status]}`}
                    />
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.assignedTo || "-"}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.department}
                </td>
                <td
                  className={`px-3 py-4 text-xs font-semibold truncate ${warrantyStyles[a.warranty]}`}
                >
                  {a.warranty}
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedAsset(a)}
                      className="text-xs text-[#235FE7] font-semibold hover:underline whitespace-nowrap"
                    >
                      View
                    </button>
                    {canRemoveAssets && (
                      <button
                        onClick={() => setAssetPendingRemoval(a)}
                        disabled={deletingAssetId === a.id}
                        className="text-xs text-red-600 font-semibold hover:underline whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingAssetId === a.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-10 text-center text-xs text-gray-400"
              >
                No assets found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {startRecord}–{endRecord}
          </span>{" "}
          of <span className="font-semibold text-gray-700">{totalRecords}</span>{" "}
          assets
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(effectivePage - 1)}
            disabled={effectivePage === 1}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-sm
                       text-gray-500 hover:bg-gray-100 disabled:opacity-30
                       disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="h-8 w-8 flex items-center justify-center text-xs text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p as number)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs
                            font-medium transition-colors
                            ${
                              effectivePage === p
                                ? "bg-[#235FE7] text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => goTo(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-sm
                       text-gray-500 hover:bg-gray-100 disabled:opacity-30
                       disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <AssetDetailsModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      <ConfirmActionModal
        isOpen={Boolean(assetPendingRemoval)}
        title="Remove Asset"
        message={
          assetPendingRemoval
            ? `Remove ${assetPendingRemoval.tag} from the register? This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove Asset"
        isLoading={
          Boolean(assetPendingRemoval) &&
          deletingAssetId === assetPendingRemoval?.id
        }
        onClose={() => setAssetPendingRemoval(null)}
        onConfirm={confirmRemoveAsset}
      />
    </>
  );
};

export default AssetTable;
