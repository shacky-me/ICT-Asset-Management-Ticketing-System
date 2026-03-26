"use client";
import { useState } from "react";
import TicketStatsBar from "@/components/tickets/TicketStatsBar";
import TicketFilterTabs from "@/components/tickets/TicketFilterTabs";
import TicketTable from "@/components/tickets/TicketTable";
import { Button } from "@/components/ui/button";
import RaiseTicketModal from "@/components/modals/RaiseTicketModal";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isTicketOpen, setIsTicketOpen] = useState(false);

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

        <TicketStatsBar />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <TicketFilterTabs active={activeTab} onTabChange={setActiveTab} />
          <TicketTable activeTab={activeTab} />
        </div>
      </div>
    </>
  );
};

export default TicketsPage;
