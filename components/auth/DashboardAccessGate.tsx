"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/session";
import {
  canAccessRoute,
  getFirstAllowedRoute,
  normalizeRole,
  type AppRole,
} from "@/lib/rbac";

type Props = {
  children: React.ReactNode;
};

const DASHBOARD_ROUTES = new Set([
  "/overview",
  "/assets",
  "/tickets",
  "/assignments",
  "/reports",
  "/settings",
]);

export default function DashboardAccessGate({ children }: Props) {
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === undefined) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!DASHBOARD_ROUTES.has(pathname)) return;

    const role: AppRole = normalizeRole(user.role);
    if (!canAccessRoute(role, pathname)) {
      router.replace(getFirstAllowedRoute(role));
    }
  }, [pathname, router, user]);

  if (user === undefined || !user) return null;

  const role = normalizeRole(user.role);
  if (DASHBOARD_ROUTES.has(pathname) && !canAccessRoute(role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
