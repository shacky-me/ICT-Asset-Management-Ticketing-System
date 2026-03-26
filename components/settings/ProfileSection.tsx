import { Info } from "lucide-react";

const profile = {
  name: "Jane Doe",
  role: "ICT Officer",
  department: "ICT Department",
  email: "jane.doe@ag.go.ke",
  staffNo: "ICT-2024-012",
  initials: "JD",
};

const ProfileSection = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">My Profile</p>
        <p className="text-xs text-gray-400">Your account information</p>
      </div>

      <div className="px-6 py-5 flex items-start gap-5">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-full bg-[#235FE7] flex items-center justify-center shrink-0">
          <span className="text-lg p-2 font-bold text-white">
            {profile.initials}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: profile.name },
            { label: "Staff No.", value: profile.staffNo },
            { label: "Role", value: profile.role },
            { label: "Department", value: profile.department },
            { label: "Email", value: profile.email },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="mx-6 mb-5 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-600">
          Profile details can only be updated by the system administrator.
          Contact ICT support to request changes.
        </p>
      </div>
    </div>
  );
};
export default ProfileSection;
