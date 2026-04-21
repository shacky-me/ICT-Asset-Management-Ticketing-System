import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardAccessGate from "@/components/auth/DashboardAccessGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAccessGate>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DashboardAccessGate>
  );
}
