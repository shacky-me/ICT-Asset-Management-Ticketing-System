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
import { useDashboardSearch } from "@/lib/dashboardSearch";
import { useAssets } from "@/lib/assets";
import { useTickets } from "@/lib/tickets";
import { useAssignments } from "@/lib/assignments";

const OverviewPage = () => {
  const currentUser = useCurrentUser();
  const role = normalizeRole(currentUser?.role);

  const showAssetOps = role === "ict_officer" || role === "ict_admin";
  const showDepartmentReports =
    role === "supervisor" || role === "ict_officer" || role === "ict_admin";
  const search = useDashboardSearch();
  const { assets: dashboardAssets, stats: assetStats } = useAssets();
  const { tickets: dashboardTickets, openOrInProgress } = useTickets();
  const { items: dashboardAssignments } = useAssignments();

  const totalAssets = assetStats.total;
  const assignedAssets = assetStats.assigned;
  const inStoreAssets = assetStats.inStore;
  const maintenanceAssets = assetStats.maintenance;
  const now = new Date();
  const currentMonthAddedAssets = dashboardAssets.filter((asset) => {
    const createdAt = new Date(asset.createdAt);
    return (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth()
    );
  }).length;
  const utilizationPercent =
    totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;
  const openTickets = openOrInProgress;
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
          sub={
            showAssetOps
              ? `+${currentMonthAddedAssets} this month`
              : "Awaiting ICT response"
          }
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
              sub={`${utilizationPercent}% utilised`}
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
        {showAssetOps && <AssetsByCategory assets={dashboardAssets} />}
        <RecentActivity
          assets={dashboardAssets}
          tickets={dashboardTickets}
          assignments={dashboardAssignments}
        />
        {showDepartmentReports && (
          <DepartmentOverview assets={dashboardAssets} />
        )}
      </div>

      {/* Tables */}
      {showAssetOps && (
        <AssetRegisterTable search={search} assets={dashboardAssets} />
      )}
      <OpenTicketsTable search={search} tickets={dashboardTickets} />
    </div>
  );
};

export default OverviewPage;
