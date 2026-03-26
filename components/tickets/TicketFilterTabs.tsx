"use client";

const tabs = ["All", "Open", "In Progress", "Pending", "Resolved"];

interface Props {
  active: string;
  onTabChange: (tab: string) => void;
}

const TicketFilterTabs = ({ active, onTabChange }: Props) => {
  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            active === tab
              ? "bg-[#235FE7] text-white"
              : "text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
export default TicketFilterTabs;
