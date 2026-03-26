"use client";
import { useState } from "react";
import AssetStatsBar from "@/components/assets/AssetStatsBar";
import AssetFilterTabs from "@/components/assets/AssetFilterTabs";
import AssetTable from "@/components/assets/AssetTable";
import RegisterAssetModal from "@/components/modals/RegisterAssetModal";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const AssetsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);

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
            <Button variant="outline" className="gap-2 text-sm cursor-pointer">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#235FE7] hover:bg-[#1a4fd6] gap-1 text-sm cursor-pointer"
            >
              + Register Asset
            </Button>
          </div>
        </div>

        <AssetStatsBar />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <AssetFilterTabs active={activeTab} onTabChange={setActiveTab} />
          <AssetTable activeTab={activeTab} />
        </div>
      </div>
    </>
  );
};

export default AssetsPage;
