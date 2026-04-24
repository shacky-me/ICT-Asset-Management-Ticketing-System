"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthToken,
  clearCurrentUser,
  readSessionActivity,
  readAuthToken,
  saveCurrentUser,
  touchSessionActivity,
  useCurrentUser,
} from "@/lib/session";
import { getAuthMe, logout } from "@/lib/apiClient";
import { clearNotifications } from "@/lib/notifications";
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

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_UPDATE_THROTTLE_MS = 10 * 1000;
const SESSION_CHECK_INTERVAL_MS = 15 * 1000;

export default function DashboardAccessGate({ children }: Props) {
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (user === undefined) return;

    const token = readAuthToken();
    if (!user || !token) return;

    let signedOut = false;
    let lastActivityWrite = 0;

    const markActivity = () => {
      const now = Date.now();
      if (now - lastActivityWrite < ACTIVITY_UPDATE_THROTTLE_MS) return;
      touchSessionActivity(now);
      lastActivityWrite = now;
    };

    const signOutForInactivity = async () => {
      if (signedOut) return;
      signedOut = true;

      await logout().catch(() => {
        // Keep client-side timeout logout behavior when backend logout fails.
      });
      clearAuthToken();
      clearCurrentUser();
      clearNotifications();
      router.replace("/login");
    };

    const checkIdleSession = () => {
      if (!readAuthToken()) return;

      const lastActivity = readSessionActivity();
      if (!lastActivity) {
        markActivity();
        return;
      }

      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        void signOutForInactivity();
      }
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markActivity();
      }
    };

    const handleWindowFocus = () => {
      markActivity();
    };

    markActivity();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    const intervalId = window.setInterval(
      checkIdleSession,
      SESSION_CHECK_INTERVAL_MS,
    );

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.clearInterval(intervalId);
    };
  }, [router, user]);

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
