"use client";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tabs = [
  { label: "All", badge: null },
  { label: "Active", badge: null },
  { label: "Returned", badge: null },
  { label: "Overdue", badge: 12 },
];

interface Props {
  active: string;
  onTabChange: (tab: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

const AssignmentFilterTabs = ({
  active,
  onTabChange,
  search,
  onSearchChange,
}: Props) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 gap-4">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.label)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              active === tab.label
                ? "bg-[#235FE7] text-white"
                : "text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active === tab.label
                    ? "bg-white text-[#235FE7]"
                    : "bg-red-500 text-white"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search name, tag, ref..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-xs w-48 bg-gray-50 border-gray-200"
          />
        </div>
        <Button
          variant="outline"
          className="h-8 gap-1.5 text-xs cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
        <Button
          variant="outline"
          className="h-8 gap-1.5 text-xs cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>
    </div>
  );
};
export default AssignmentFilterTabs;
