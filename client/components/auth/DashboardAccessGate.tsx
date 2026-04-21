"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthToken,
  clearCurrentUser,
  readAuthToken,
  saveCurrentUser,
  useCurrentUser,
} from "@/lib/session";
import { getAuthMe } from "@/lib/apiClient";
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
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (user === undefined) return;

    let cancelled = false;

    const validateSession = async () => {
      const token = readAuthToken();
      if (!user || !token) {
        if (!cancelled) {
          setSessionChecked(true);
          router.replace("/login");
        }
        return;
      }

      if (user.mustChangePassword) {
        if (!cancelled) {
          setSessionChecked(true);
          router.replace("/reset-password?firstLogin=1");
        }
        return;
      }

      try {
        const meResponse = await getAuthMe();
        if (cancelled) return;

        const persistent =
          typeof window !== "undefined" &&
          Boolean(window.localStorage.getItem("ictams.currentUser"));

        saveCurrentUser(meResponse.user, { persistent });

        if (meResponse.user.mustChangePassword) {
          router.replace("/reset-password?firstLogin=1");
          return;
        }

        if (DASHBOARD_ROUTES.has(pathname)) {
          const role: AppRole = normalizeRole(meResponse.user.role);
          if (!canAccessRoute(role, pathname)) {
            router.replace(getFirstAllowedRoute(role));
            return;
          }
        }

        setSessionChecked(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";
        const shouldLogout =
          message.includes("unauthorized") ||
          message.includes("invalid token") ||
          message.includes("no token provided") ||
          message.includes("status 401") ||
          message.includes("status 403");

        if (!cancelled) {
          setSessionChecked(true);

          if (shouldLogout) {
            clearAuthToken();
            clearCurrentUser();
            router.replace("/login");
          }
        }
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, user]);

  if (user === undefined || !user || !readAuthToken() || !sessionChecked)
    return null;

  if (user.mustChangePassword) return null;

  const role = normalizeRole(user.role);
  if (DASHBOARD_ROUTES.has(pathname) && !canAccessRoute(role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
