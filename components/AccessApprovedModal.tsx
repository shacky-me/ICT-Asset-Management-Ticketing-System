import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

interface AccessApprovedModalProps {
  name: string;
  role: string;
  payroll: string;
  department: string;
  email: string;
  reason?: string;
  temporaryPassword?: string;
}

const AccessApprovedModal = ({
  name,
  role,
  payroll,
  department,
  email,
  reason,
  temporaryPassword,
}: AccessApprovedModalProps) => {
  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center px-4 z-50">
      {/* Modal card */}
      <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow-xl px-8 py-10 flex flex-col items-center gap-6">
        {/* Success icon */}
        <div className="h-16 w-16 rounded-full border-2 border-green-400 flex items-center justify-center">
          <CheckIcon className="h-8 w-8 text-green-500 stroke-[2.5]" />
        </div>

        {/* Title + message */}
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Access Approved</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account has been created. A temporary password has been sent to
          </p>
          <p className="text-sm text-[#235FE7] font-medium">{email}</p>
        </div>

        {/* Details table */}
        <div className="w-full border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-sm font-medium">{name}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-sm font-medium">{role}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-sm font-medium">{department}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500">Payroll No.</p>
            <p className="text-sm font-medium">{payroll}</p>
          </div>
          {reason && (
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-gray-500">Reason</p>
              <p className="text-sm font-medium">{reason}</p>
            </div>
          )}
        </div>

        {/* Password change notice */}
        <p className="text-xs text-gray-400 text-center">
          You will be required to change your password on first login.
        </p>

        {temporaryPassword && (
          <div className="w-full bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">
              Temporary Password
            </p>
            <p className="text-sm font-mono font-bold text-blue-900 mt-1">
              {temporaryPassword}
            </p>
            <p className="text-[11px] text-blue-700 mt-1">
              Use this with your email, then set a new password.
            </p>
          </div>
        )}

        {/* CTA */}
        <Link href="/login" className="w-full">
          <Button className="w-full bg-[#235FE7] cursor-pointer">
            Go To Login
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AccessApprovedModal;
