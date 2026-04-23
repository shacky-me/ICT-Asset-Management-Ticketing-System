"use client";

import ProfileSection from "@/components/settings/ProfileSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import AboutSection from "@/components/settings/AboutSection";
import UserManagementSection from "@/components/settings/UserManagementSection";
import { useCurrentUser } from "@/lib/session";
import { canViewSettings, normalizeRole } from "@/lib/rbac";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SettingsPage = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const role = normalizeRole(currentUser?.role);

  useEffect(() => {
    if (currentUser && !canViewSettings(role)) {
      router.replace("/overview");
    }
  }, [currentUser, role, router]);

  if (currentUser === undefined) return null;

  if (!currentUser || !canViewSettings(role)) return null;

  return (
    <div className="space-y-6 w-full max-w-275">
      <div>
        <h1 className="text-base font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400">
          Manage your preferences and system configuration
        </p>
      </div>

      <ProfileSection />
      <UserManagementSection />
      <PreferencesSection />
      <AboutSection />
    </div>
  );
};

export default SettingsPage;
