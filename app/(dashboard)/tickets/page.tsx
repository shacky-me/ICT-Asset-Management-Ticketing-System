"use client";
import { useState } from "react";
import TicketStatsBar from "@/components/tickets/TicketStatsBar";
import TicketFilterTabs from "@/components/tickets/TicketFilterTabs";
import TicketTable from "@/components/tickets/TicketTable";
import { Button } from "@/components/ui/button";
import RaiseTicketModal from "@/components/modals/RaiseTicketModal";
import { useDashboardSearch } from "@/lib/dashboardSearch";
import { useTickets } from "@/lib/tickets";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const search = useDashboardSearch();
  const { tickets, stats } = useTickets();

  return (
    <>
      {" "}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Support Tickets
            </h1>
            <p className="text-xs text-gray-400">
              ICT helpdesk requests & issue tracking
            </p>
          </div>
          <Button
            onClick={() => setIsTicketOpen(true)}
            className="bg-[#235FE7] hover:bg-[#1a4fd6] text-sm cursor-pointer"
          >
            + Raise Ticket
          </Button>
          <RaiseTicketModal
            isOpen={isTicketOpen}
            onClose={() => setIsTicketOpen(false)}
          />
        </div>

        <TicketStatsBar
          open={stats.open}
          inProgress={stats.inProgress}
          pending={stats.pending}
          resolved={stats.resolved}
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <TicketFilterTabs active={activeTab} onTabChange={setActiveTab} />
          <TicketTable
            activeTab={activeTab}
            search={search}
            tickets={tickets}
          />
        </div>
      </div>
    </>
  );
};

export default TicketsPage;
