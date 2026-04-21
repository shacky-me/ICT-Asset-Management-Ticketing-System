"use client";
import { useMemo, useState } from "react";
import AssetStatsBar from "@/components/assets/AssetStatsBar";
import AssetFilterTabs from "@/components/assets/AssetFilterTabs";
import AssetTable from "@/components/assets/AssetTable";
import RegisterAssetModal from "@/components/modals/RegisterAssetModal";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { canRegisterAsset, normalizeRole } from "@/lib/rbac";
import { useDashboardSearch } from "@/lib/dashboardSearch";
import { useAssets } from "@/lib/assets";

const AssetsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const currentUser = useCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const allowRegisterAsset = canRegisterAsset(role);
  const search = useDashboardSearch();
  const { assets, stats } = useAssets();

  const categories = useMemo(
    () => Array.from(new Set(assets.map((item) => item.category))).sort(),
    [assets],
  );
  const departments = useMemo(
    () => Array.from(new Set(assets.map((item) => item.department))).sort(),
    [assets],
  );

  return (
    <>
      {showModal && (
        <RegisterAssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Asset Register
            </h1>
            <p className="text-xs text-gray-400">All register ICT assets</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilterPanel((prev) => !prev)}
              variant="outline"
              className="gap-2 text-sm cursor-pointer"
            >
              <Filter className="h-4 w-4" /> Filter
            </Button>
            {allowRegisterAsset && (
              <Button
                onClick={() => setShowModal(true)}
                className="bg-[#235FE7] hover:bg-[#1a4fd6] gap-1 text-sm cursor-pointer"
              >
                + Register Asset
              </Button>
            )}
          </div>
        </div>

        <AssetStatsBar
          total={stats.total}
          assigned={stats.assigned}
          inStore={stats.inStore}
          maintenance={stats.maintenance}
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {showFilterPanel && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-xs"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-xs"
              >
                <option value="All Departments">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setCategoryFilter("All Categories");
                  setDepartmentFilter("All Departments");
                }}
                className="h-8 px-3 rounded-md border border-gray-200 text-xs text-slate-600 hover:bg-white"
              >
                Clear
              </button>
            </div>
          )}
          <AssetFilterTabs
            active={activeTab}
            onTabChange={setActiveTab}
            assets={assets}
          />
          <AssetTable
            assets={assets}
            activeTab={activeTab}
            search={search}
            categoryFilter={categoryFilter}
            departmentFilter={departmentFilter}
          />
        </div>
      </div>
    </>
  );
};

export default AssetsPage;
