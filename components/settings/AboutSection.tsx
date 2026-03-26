const AboutSection = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">About System</p>
        <p className="text-xs text-gray-400">
          System information and license details
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {[
          {
            label: "System Name",
            value: "ICT Asset Management & Tracking System",
          },
          {
            label: "Organization",
            value:
              "State Department for Justice, Human Rights & Constitutional Affairs",
          },
          { label: "Last Backup", value: "23 Mar, 2026 - 02:00 AM" },
          {
            label: "License",
            value: "Government of Kenya - Internal Use Only",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-6 py-3"
          >
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="text-xs font-medium text-gray-900 text-right max-w-xs">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AboutSection;
