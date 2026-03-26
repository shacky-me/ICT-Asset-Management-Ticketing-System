"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import RegisterAssetModal from "../modals/RegisterAssetModal";
import { useState } from "react";

const assets = [
  {
    tag: "KE-ICT-L-041",
    name: "Dell Latitude 5540",
    category: "Laptop",
    serial: "DL-20491-KE",
    status: "Assigned",
    assignedTo: "J. Mwangi",
    department: "Legal",
  },
  {
    tag: "KE-ICT-P-040",
    name: "HP LaserJet Pro M404dn",
    category: "Printer",
    serial: "HP-10832-KE",
    status: "In Store",
    assignedTo: "—",
    department: "—",
  },
  {
    tag: "KE-ICT-D-039",
    name: "Lenovo ThinkCentre M90q",
    category: "Desktop",
    serial: "LN-38821-KE",
    status: "Assigned",
    assignedTo: "B. Otieno",
    department: "Finance",
  },
  {
    tag: "KE-ICT-N-038",
    name: "Cisco Catalyst 2960-X",
    category: "Networking",
    serial: "CS-00291-KE",
    status: "Maintenance",
    assignedTo: "T. Kamau",
    department: "ICT",
  },
  {
    tag: "KE-ICT-S-037",
    name: "Epson WorkForce DS-530",
    category: "Scanner",
    serial: "EP-49921-KE",
    status: "Assigned",
    assignedTo: "M. Njeru",
    department: "Constitutional",
  },
  {
    tag: "KE-ICT-U-036",
    name: "APC Smart-UPS 1500VA",
    category: "UPS",
    serial: "APC-1001-KE",
    status: "In Store",
    assignedTo: "—",
    department: "—",
  },
  {
    tag: "KE-ICT-L-035",
    name: "HP EliteBook 840 G9",
    category: "Laptop",
    serial: "HP-84091-KE",
    status: "Assigned",
    assignedTo: "P. Odhiambo",
    department: "HR",
  },
  {
    tag: "KE-ICT-M-034",
    name: 'Samsung 27" Monitor',
    category: "Monitor",
    serial: "SM-27041-KE",
    status: "Assigned",
    assignedTo: "S. Kariuki",
    department: "Admin",
  },
];

const statusStyles: Record<string, string> = {
  Assigned: "bg-green-100 text-green-700",
  "In Store": "bg-blue-100 text-blue-700",
  Maintenance: "bg-orange-100 text-orange-700",
};

const AssetRegisterTable = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      {showModal && (
        <RegisterAssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">Asset Register</p>
            <p className="text-xs text-gray-400">
              Recently registered ICT assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-sm cursor-pointer">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#235FE7] gap-2 text-sm cursor-pointer"
            >
              + Register
            </Button>
          </div>
        </div>
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-32">
                Asset Tag
              </th>
              <th className="px-4 py-3 text-left font-medium w-36">Name</th>
              <th className="px-4 py-3 text-left font-medium w-24">Category</th>
              <th className="px-4 py-3 text-left font-medium w-28">
                Serial No.
              </th>
              <th className="px-4 py-3 text-left font-medium w-28">Status</th>
              <th className="px-4 py-3 text-left font-medium w-32">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left font-medium w-28">
                Department
              </th>
              <th className="px-4 py-3 text-left font-medium w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map((a) => (
              <tr key={a.tag} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[#235FE7] font-medium">
                  {a.tag}
                </td>
                <td className="px-4 py-3 text-gray-700">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.category}</td>
                <td className="px-4 py-3 text-gray-500">{a.serial}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[a.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{a.assignedTo}</td>
                <td className="px-4 py-3 text-gray-500">{a.department}</td>
                <td className="px-4 py-3 text-[#235FE7] font-medium cursor-pointer hover:underline">
                  View →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing 1-5 of 1000 assets</p>
          <div className="flex items-center gap-1 text-sm">
            <button className="px-2 py-1 rounded hover:bg-gray-100">←</button>
            {[1, 2, 3, "...", 1000].map((p, i) => (
              <button
                key={i}
                className={`px-2.5 py-1 rounded text-xs ${p === 1 ? "bg-[#235FE7] text-white" : "hover:bg-gray-100 text-gray-600"}`}
              >
                {p}
              </button>
            ))}
            <button className="px-2 py-1 rounded hover:bg-gray-100">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AssetRegisterTable;
