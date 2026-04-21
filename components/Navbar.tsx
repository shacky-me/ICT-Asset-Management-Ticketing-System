"use client";
import { Bell, Search, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import RaiseTicketModal from "./modals/RaiseTicketModal";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotifications,
} from "@/lib/notifications";
import { getInitials, useCurrentUser } from "@/lib/session";
import {
  publishDashboardSearch,
  useDashboardSearch,
} from "@/lib/dashboardSearch";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Dashboard",
  "/assets": "Assets",
  "/tickets": "Tickets",
  "/assignments": "Assignments",
  "/reports": "Reports",
  "/settings": "Settings",
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

const Navbar = () => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items: notifications, unreadCount } = useNotifications();
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const notificationRef = useRef<HTMLDivElement>(null);
  const globalSearch = useDashboardSearch();

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";
  const initials = useMemo(() => {
    if (currentUser?.initials) return currentUser.initials;
    return getInitials(currentUser?.name || currentUser?.email || "User");
  }, [currentUser?.email, currentUser?.initials, currentUser?.name]);

  useEffect(() => {
    setSearchTerm(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

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
            {pageTitle}
          </Link>
        </p>
        <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right — search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            publishDashboardSearch(searchTerm);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets, tickets..."
            value={searchTerm}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchTerm(nextValue);
              publishDashboardSearch(nextValue);
            }}
            className="pl-9 w-64 text-sm bg-gray-50 border-gray-200"
          />
        </form>

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
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 bg-[#235FE7] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-30">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">
                  Notifications
                </p>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 text-center">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        notification.read ? "bg-white" : "bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">
                          {notification.title}
                        </p>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-[#235FE7] flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
