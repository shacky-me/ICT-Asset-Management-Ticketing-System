"use client";

import StatsBar from "@/components/dashboard/StatsBar";
import StatCard from "@/components/dashboard/StatCard";
import AssetsByCategory from "@/components/dashboard/AssetsByCategory";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DepartmentOverview from "@/components/dashboard/DepartmentOverview";
import AssetRegisterTable from "@/components/dashboard/AssetRegisterTable";
import OpenTicketsTable from "@/components/dashboard/OpenTicketsTable";
import { Monitor, Tag, Store, Wrench, Ticket } from "lucide-react";
import { useCurrentUser } from "@/lib/session";
import { normalizeRole } from "@/lib/rbac";
import { assets as dashboardAssets } from "@/components/dashboard/AssetRegisterTable";
import { tickets as dashboardTickets } from "@/components/dashboard/OpenTicketsTable";
import { useDashboardSearch } from "@/lib/dashboardSearch";

const OverviewPage = () => {
  const currentUser = useCurrentUser();
  const role = normalizeRole(currentUser?.role);

  const showAssetOps = role === "ict_officer" || role === "ict_admin";
  const showDepartmentReports =
    role === "supervisor" || role === "ict_officer" || role === "ict_admin";
  const search = useDashboardSearch();

  const totalAssets = dashboardAssets.length;
  const assignedAssets = dashboardAssets.filter(
    (asset) => asset.status === "Assigned",
  ).length;
  const inStoreAssets = dashboardAssets.filter(
    (asset) => asset.status === "In Store",
  ).length;
  const maintenanceAssets = dashboardAssets.filter(
    (asset) => asset.status === "Maintenance",
  ).length;
  const openTickets = dashboardTickets.filter(
    (ticket) => ticket.status === "Open" || ticket.status === "In Progress",
  ).length;
  const resolvedTickets = dashboardTickets.filter(
    (ticket) => ticket.status === "Resolved",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top stats bar */}
      <StatsBar
        totalAssets={totalAssets}
        assignedAssets={assignedAssets}
        inStoreAssets={inStoreAssets}
      />

      {/* Stat cards */}
      <div
        className={`grid gap-4 ${showAssetOps ? "grid-cols-5" : "grid-cols-2"}`}
      >
        <StatCard
          label={showAssetOps ? "Total Assets" : "My Open Tickets"}
          value={showAssetOps ? totalAssets : openTickets}
          sub={showAssetOps ? "+100 this month" : "Awaiting ICT response"}
          subColor="text-[#235FE7]"
          icon={showAssetOps ? Monitor : Ticket}
          iconColor="text-[#235FE7]"
        />
        <StatCard
          label={showAssetOps ? "Open Tickets" : "Resolved This Month"}
          value={showAssetOps ? openTickets : resolvedTickets}
          sub={showAssetOps ? "Require attention" : "Your completed requests"}
          subColor="text-red-500"
          icon={Ticket}
          iconColor="text-red-500"
        />

        {showAssetOps && (
          <>
            <StatCard
              label="Assigned"
              value={assignedAssets}
              sub="50% utilised"
              subColor="text-purple-500"
              icon={Tag}
              iconColor="text-purple-500"
            />
            <StatCard
              label="In Store"
              value={inStoreAssets}
              sub="Available stock"
              subColor="text-green-500"
              icon={Store}
              iconColor="text-green-500"
            />
            <StatCard
              label="Maintenance"
              value={maintenanceAssets}
              sub="Being serviced"
              subColor="text-orange-500"
              icon={Wrench}
              iconColor="text-orange-500"
            />
          </>
        )}
      </div>

      {/* Middle row */}
      <div
        className={`grid gap-4 ${showAssetOps ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {showAssetOps && <AssetsByCategory />}
        <RecentActivity />
        {showDepartmentReports && <DepartmentOverview />}
      </div>

      {/* Tables */}
      {showAssetOps && <AssetRegisterTable search={search} />}
      <OpenTicketsTable search={search} />
    </div>
  );
};

export default OverviewPage;
