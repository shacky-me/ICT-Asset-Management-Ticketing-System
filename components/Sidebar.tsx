"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/app/assets/COA.svg";
import LogoText from "@/app/assets/LogoText.svg";
import { navLinks } from "@/lib/navlinks";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { LogOut, Plus } from "lucide-react";
import { useState } from "react";
import RegisterAssetModal from "./modals/RegisterAssetModal";
import LogoutModal from "./modals/logout/LogoutModal";
import { clearCurrentUser, getInitials, useCurrentUser } from "@/lib/session";
import { clearNotifications, useNotifications } from "@/lib/notifications";
import { logout } from "@/lib/apiClient";
import { canAccessRoute, canRegisterAsset, normalizeRole } from "@/lib/rbac";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const currentUser = useCurrentUser();
  const { items: notifications } = useNotifications();

  const unresolvedTicketCount = notifications.filter(
    (notification) => !notification.read && notification.type === "ticket",
  ).length;

  const profileName = currentUser?.name || "Jane Doe";
  const profileRole = currentUser?.role || "ICT Officer";
  const profileInitials =
    currentUser?.initials ||
    getInitials(currentUser?.name || currentUser?.email || "Jane Doe");
  const role = normalizeRole(currentUser?.role);

  return (
    <>
      {showModal && (
        <RegisterAssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      <aside className="h-screen w-56 flex flex-col border-r border-gray-200 bg-white py-4">
        {/* Logo + org info */}
        <div className="flex items-center gap-2 mb-2 px-5">
          <Link href="/overview" className="flex items-center gap-2">
            <Image src={Logo} alt="Logo" className="h-10 w-10 shrink-0" />
            <Image src={LogoText} alt="Logo Text" className="h-8 w-auto" />
          </Link>
        </div>

        <Separator className="mb-6" />

        {/* Nav section */}
        <div className="px-5 flex-1">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-2 mb-2">
            Navigation
          </p>
          <nav className="flex flex-col gap-0.5">
            {navLinks
              .filter((link) => canAccessRoute(role, link.href))
              .map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[#EEF3FD] text-[#235FE7] font-semibold"
                        : "text-gray-600 hover:bg-gray-100 font-medium",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-[#235FE7]" : "text-gray-500",
                        )}
                      />
                      {link.label}
                    </div>
                    {(
                      link.href === "/tickets"
                        ? unresolvedTicketCount
                        : link.badge
                    ) ? (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-[#235FE7] text-white">
                        {link.href === "/tickets"
                          ? unresolvedTicketCount
                          : link.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="px-5 flex flex-col gap-4">
          <Separator />

          {/* Register Asset button */}
          {canRegisterAsset(role) && (
            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-[#235FE7] hover:bg-[#1a4fd6] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register Asset
            </Button>
          )}

          {/* User profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-[#235FE7] flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-white">
                  {profileInitials}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {profileName}
                </p>
                <p className="text-xs text-gray-500">{profileRole}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogout(true)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <LogoutModal
              isOpen={showLogout}
              onClose={() => setShowLogout(false)}
              onLogout={async () => {
                await logout().catch(() => {
                  // Keep local logout behavior even if backend is unreachable.
                });
                clearCurrentUser();
                clearNotifications();
                setShowLogout(false);
                router.push("/login");
              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
