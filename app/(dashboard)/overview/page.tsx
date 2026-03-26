import StatsBar from "@/components/dashboard/StatsBar";
import StatCard from "@/components/dashboard/StatCard";
import AssetsByCategory from "@/components/dashboard/AssetsByCategory";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DepartmentOverview from "@/components/dashboard/DepartmentOverview";
import AssetRegisterTable from "@/components/dashboard/AssetRegisterTable";
import OpenTicketsTable from "@/components/dashboard/OpenTicketsTable";
import { Monitor, Tag, Store, Wrench, Ticket } from "lucide-react";

const OverviewPage = () => {
  return (
    <div className="space-y-6">
      {/* Top stats bar */}
      <StatsBar />

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="Total Assets"
          value={1000}
          sub="+100 this month"
          subColor="text-[#235FE7]"
          icon={Monitor}
          iconColor="text-[#235FE7]"
        />
        <StatCard
          label="Assigned"
          value={900}
          sub="50% utilised"
          subColor="text-purple-500"
          icon={Tag}
          iconColor="text-purple-500"
        />
        <StatCard
          label="In Store"
          value={200}
          sub="Available stock"
          subColor="text-green-500"
          icon={Store}
          iconColor="text-green-500"
        />
        <StatCard
          label="Maintenance"
          value={30}
          sub="Being serviced"
          subColor="text-orange-500"
          icon={Wrench}
          iconColor="text-orange-500"
        />
        <StatCard
          label="Open Tickets"
          value={18}
          sub="Require attention"
          subColor="text-red-500"
          icon={Ticket}
          iconColor="text-red-500"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">
        <AssetsByCategory />
        <RecentActivity />
        <DepartmentOverview />
      </div>

      {/* Tables */}
      <AssetRegisterTable />
      <OpenTicketsTable />
    </div>
  );
};

export default OverviewPage;
