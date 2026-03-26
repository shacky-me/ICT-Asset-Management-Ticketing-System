"use client";
import { useState } from "react";
import AssignmentStatsBar from "@/components/assignments/AssignmentStatsBar";
import AssignmentAlert from "@/components/assignments/AssignmentAlert";
import AssignmentFilterTabs from "@/components/assignments/AssignmentFilterTabs";
import AssignmentTable from "@/components/assignments/AssignmentTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Assignments</h1>
          <p className="text-xs text-gray-400">
            ICT Asset assignment records, handover certificates and return
            management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-sm cursor-pointer">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-[#235FE7] hover:bg-[#1a4fd6] text-sm cursor-pointer">
            + New Assignment
          </Button>
        </div>
      </div>

      <AssignmentStatsBar />
      <AssignmentAlert />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <AssignmentFilterTabs
          active={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
        />
        <AssignmentTable activeTab={activeTab} search={search} />
      </div>
    </div>
  );
};

export default AssignmentsPage;
