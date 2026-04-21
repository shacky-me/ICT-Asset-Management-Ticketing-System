"use client";
import { useEffect, useMemo, useState } from "react";
import AssignmentStatsBar from "@/components/assignments/AssignmentStatsBar";
import AssignmentAlert from "@/components/assignments/AssignmentAlert";
import AssignmentFilterTabs from "@/components/assignments/AssignmentFilterTabs";
import AssignmentTable from "@/components/assignments/AssignmentTable";
import AssignmentModal from "@/components/modals/AssignmentModal";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { canManageAssignments, normalizeRole } from "@/lib/rbac";
import { exportToCSV } from "@/app/utils/csvUtils";
import { useAssignments } from "@/lib/assignments";
import { useDashboardSearch } from "@/lib/dashboardSearch";
import type { AssignmentRecord } from "@/lib/assignments";

const AssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<AssignmentRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUser = useCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const allowAssignmentManagement = canManageAssignments(role);
  const { items: assignments, stats } = useAssignments();
  const globalSearch = useDashboardSearch();

  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  const departments = useMemo(
    () =>
      Array.from(new Set(assignments.map((item) => item.department))).sort(),
    [assignments],
  );

  const assignmentThisMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return assignments.filter((item) => {
      const date = new Date(item.dateIssued);
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;
  }, [assignments]);

  const exportRows = useMemo(
    () =>
      assignments
        .filter((a) => activeTab === "All" || a.status === activeTab)
        .filter(
          (a) =>
            department === "All Departments" || a.department === department,
        )
        .filter(
          (a) =>
            search === "" ||
            a.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
            a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
            a.ref.toLowerCase().includes(search.toLowerCase()) ||
            a.assetName.toLowerCase().includes(search.toLowerCase()),
        )
        .map((a) => ({
          "Ref No.": a.ref,
          "Asset Tag": a.assetTag,
          "Asset Name": a.assetName,
          "Assigned To": a.assignedTo,
          Department: a.department,
          "Date Issued": a.dateIssued,
          Status: a.status,
        })),
    [activeTab, assignments, department, search],
  );

  const handleExport = () => {
    exportToCSV(exportRows, "assignments.csv");
  };

  const handleOpenNew = () => {
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleEditAssignment = (assignment: AssignmentRecord) => {
    setEditingAssignment(assignment);
    setShowModal(true);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2 text-sm cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          {allowAssignmentManagement && (
            <Button
              onClick={handleOpenNew}
              className="bg-[#235FE7] hover:bg-[#1a4fd6] text-sm cursor-pointer"
            >
              + New Assignment
            </Button>
          )}
        </div>
      </div>

      <AssignmentStatsBar
        assigned={stats.assigned}
        returned={stats.returned}
        overdue={stats.overdue}
        assignedThisMonth={assignmentThisMonth}
      />
      <AssignmentAlert
        overdueCount={stats.overdue}
        onViewOverdue={() => setActiveTab("Overdue")}
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <AssignmentFilterTabs
          active={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          department={department}
          onDepartmentChange={setDepartment}
          departments={departments}
          overdueCount={stats.overdue}
        />
        <AssignmentTable
          assignments={assignments}
          activeTab={activeTab}
          search={search}
          department={department}
          onRefresh={handleRefresh}
          onEditOpen={handleEditAssignment}
        />
      </div>

      <AssignmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAssignment(null);
        }}
        editingAssignment={editingAssignment}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default AssignmentsPage;
