"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import RegisterAssetModal from "../modals/RegisterAssetModal";

type Props = {
  totalAssets: number;
  assignedAssets: number;
  inStoreAssets: number;
  allowRegisterAsset?: boolean;
};

const StatsBar = ({
  totalAssets,
  assignedAssets,
  inStoreAssets,
  allowRegisterAsset = false,
}: Props) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {allowRegisterAsset && showModal && (
        <RegisterAssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            ICT Asset Tracking,
          </p>
          <p className="text-sm font-bold text-gray-900">
            Management & Ticketing System
          </p>
          <p className="text-xs text-[#235FE7] font-medium mt-1">Overview</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0554A8]">{totalAssets}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Assets
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0F766E]">
              {assignedAssets}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Assigned
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#6D28D9]">{inStoreAssets}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              In Store
            </p>
          </div>
        </div>
        {allowRegisterAsset && (
          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#235FE7] hover:bg-[#1a4fd6] cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Register Asset
          </Button>
        )}
      </div>
    </>
  );
};
export default StatsBar;
