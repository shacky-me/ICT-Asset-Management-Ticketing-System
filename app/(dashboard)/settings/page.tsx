import ProfileSection from "@/components/settings/ProfileSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import AboutSection from "@/components/settings/AboutSection";

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-base font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400">
          Manage your preferences and system configuration
        </p>
      </div>

      <ProfileSection />
      <PreferencesSection />
      <AboutSection />
    </div>
  );
};

export default SettingsPage;
