"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import RegisterAssetModal from "../modals/RegisterAssetModal";
import { useMemo, useState } from "react";
import { exportToCSV } from "@/app/utils/csvUtils";
import AssetDetailsModal from "@/components/assets/AssetDetailsModal";
import { deleteAsset } from "@/lib/apiClient";
import { publishAssetsChanged, type AssetRow } from "@/lib/assets";
import { addNotification } from "@/lib/notifications";

type DashboardAsset = AssetRow & { assignedTo?: string };

const statusStyles: Record<string, string> = {
  Assigned: "bg-green-100 text-green-700",
  "In Store": "bg-blue-100 text-blue-700",
  Maintenance: "bg-orange-100 text-orange-700",
};

const PAGE_SIZE = 5;

function toAssetDetails(asset: DashboardAsset) {
  return {
    tag: asset.tag,
    name: asset.name,
    category: asset.category,
    make: asset.category,
    model: asset.name,
    serial: asset.serial,
    status: asset.status,
    department: asset.department,
    warranty: "N/A",
  };
}

const AssetRegisterTable = ({
  search = "",
  assets,
}: {
  search?: string;
  assets: DashboardAsset[];
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<DashboardAsset | null>(
    null,
  );
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;

    return assets.filter(
      (asset) =>
        asset.tag.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query) ||
        asset.department.toLowerCase().includes(query),
    );
  }, [assets, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const visibleRows = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filtered]);

  const startRow =
    filtered.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(effectivePage * PAGE_SIZE, filtered.length);

  const handleExport = () => {
    const formatted = filtered.map((a) => ({
      "Asset Tag": a.tag,
      Name: a.name,
      Category: a.category,
      "Serial No.": a.serial,
      Status: a.status,
      "Assigned To": a.assignedTo,
      Department: a.department,
    }));

    exportToCSV(formatted, "asset-register.csv");
  };

  const handleRemoveAsset = async (asset: DashboardAsset) => {
    const confirmed = window.confirm(
      `Remove ${asset.tag} from the register? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingAssetId(asset.id);
      await deleteAsset(asset.id);
      addNotification({
        title: "Asset removed",
        message: `${asset.tag} was removed from the register.`,
        type: "asset",
      });
      publishAssetsChanged();
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
  };
  return (
    <div>
      {showModal && (
        <RegisterAssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">Asset Register</p>
            <p className="text-xs text-gray-400">
              Recently registered ICT assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2 text-sm cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#235FE7] gap-2 text-sm cursor-pointer"
            >
              + Register
            </Button>
          </div>
        </div>
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-32">
                Asset Tag
              </th>
              <th className="px-4 py-3 text-left font-medium w-36">Name</th>
              <th className="px-4 py-3 text-left font-medium w-24">Category</th>
              <th className="px-4 py-3 text-left font-medium w-28">
                Serial No.
              </th>
              <th className="px-4 py-3 text-left font-medium w-28">Status</th>
              <th className="px-4 py-3 text-left font-medium w-32">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left font-medium w-28">
                Department
              </th>
              <th className="px-4 py-3 text-left font-medium w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((a) => (
              <tr key={a.tag} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[#235FE7] font-medium">
                  {a.tag}
                </td>
                <td className="px-4 py-3 text-gray-700">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.category}</td>
                <td className="px-4 py-3 text-gray-500">{a.serial}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[a.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {a.assignedTo || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.department}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedAsset(a)}
                      className="text-[#235FE7] font-medium hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemoveAsset(a)}
                      disabled={deletingAssetId === a.id}
                      className="text-red-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingAssetId === a.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {startRow}-{endRow} of {filtered.length} assets
          </p>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={effectivePage === 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-xs text-gray-500 px-2">
              Page {effectivePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={effectivePage === totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <AssetDetailsModal
        asset={selectedAsset ? toAssetDetails(selectedAsset) : null}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
};
export default AssetRegisterTable;
