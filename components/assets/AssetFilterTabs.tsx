"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/app/utils/csvUtils";
import { assets } from "./AssetTable";

const tabs = ["All", "Assigned", "In Store", "Maintenance", "Flagged"];

interface Props {
  active: string;
  onTabChange: (tab: string) => void;
}

const AssetFilterTabs = ({ active, onTabChange }: Props) => {
  const handleExport = () => {
    const formatted = assets.map((a) => ({
      "Asset Tag": a.tag,
      Name: a.name,
      Category: a.category,
      Make: a.make,
      Model: a.model,
      "Serial No.": a.serial,
      Status: a.status,
      Department: a.department,
      Warranty: a.warranty,
    }));

    exportToCSV(formatted, "asset-register.csv");
  };
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              active === tab
                ? "bg-[#235FE7] text-white"
                : "text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <Button
        onClick={handleExport}
        variant="outline"
        className="gap-2 text-sm cursor-pointer"
      >
        <Download className="h-4 w-4" /> Export
      </Button>
    </div>
  );
};
export default AssetFilterTabs;
