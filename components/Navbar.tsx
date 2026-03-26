"use client";
import { Bell, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import RaiseTicketModal from "./modals/RaiseTicketModal";

const Navbar = () => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      {/* Left — breadcrumb + page title */}
      <div className="flex flex-col justify-center">
        <p className="text-xs text-gray-400">
          <Link
            href="/overview"
            className="hover:text-[#235FE7] transition-colors"
          >
            SDJHRCA
          </Link>{" "}
          /{" "}
          <Link href="/overview" className="text-[#235FE7] hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Right — search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets, tickets..."
            className="pl-9 w-64 text-sm bg-gray-50 border-gray-200"
          />
        </div>

        {/* New Ticket button */}
        <Button
          onClick={() => setIsTicketOpen(true)}
          variant="outline"
          className="gap-2 cursor-pointer text-sm font-medium"
        >
          <Ticket className="h-4 w-4" />
          New Ticket
        </Button>
        <RaiseTicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
        />

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-4 w-4 bg-[#235FE7] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            4
          </span>
        </button>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-[#235FE7] flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-white">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
