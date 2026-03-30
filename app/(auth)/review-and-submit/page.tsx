"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/assets/Logo.svg";
import { useState } from "react";
import AccessApprovedModal from "@/components/AccessApprovedModal";

const ReviewAndSubmit = () => {
  const [submitted, setSubmitted] = useState(false);

  const personalDetails = {
    payrollNo: "10020002",
    email: "you@ag.go.ke",
    department: "Human Rights Division",
    jobTitle: "Legal Officer",
  };

  const accessRequest = {
    role: "Auditor/Read-Only",
    reason: "To view available assets",
  };

  return (
    <>
      {/* Modal */}
      {submitted && (
        <AccessApprovedModal
          name="Jane Wanjiku Mwangi"
          role={accessRequest.role}
          department={personalDetails.department}
          email={personalDetails.email}
        />
      )}

      <div className="w-lg mx-auto my-16">
        <div className="bg-[#fefefe] h-[80vh] flex flex-col border border-gray-200 rounded-lg shadow-lg shadow-gray-200">
          {/* Sticky top — logo + progress */}
          <div className="flex flex-col items-center gap-4 px-16 pt-6 pb-4 border-b border-gray-100">
            <Image src={Logo} alt="Logo" className="h-8 w-60" />
            <div className="w-full space-y-2">
              <h1 className="font-bold">Request Access</h1>
              <p className="text-sm text-gray-700">
                Step 3 of 3 •{" "}
                <span className="font-semibold">Review & Submit</span>
              </p>
              <Progress value={100} className="[&>div]:bg-[#2B66E6]" />
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-16 py-6 space-y-6">
            {/* Personal Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Personal Details
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-gray-500">Payroll No.</p>
                  <p className="text-sm font-medium">
                    {personalDetails.payrollNo}
                  </p>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{personalDetails.email}</p>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-sm font-medium">
                    {personalDetails.department}
                  </p>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="text-sm font-medium">
                    {personalDetails.jobTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Access Request */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                  Access Request
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium text-[#235FE7]">
                    {accessRequest.role}
                  </p>
                </div>
                <div className="flex flex-col gap-1 px-4 py-3">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-sm font-medium">{accessRequest.reason}</p>
                </div>
              </div>
            </div>

            {/* Auto-approval notice */}
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <div className="mt-0.5 text-green-600">✓</div>
              <p className="text-sm text-gray-700">
                Your account will be{" "}
                <span className="text-green-600 font-medium">
                  auto-approved immediately
                </span>
                . A temporary password will be sent to{" "}
                <span className="font-semibold">{personalDetails.email}.</span>
              </p>
            </div>

            {/* CTA */}
            <div className="w-full flex items-center justify-between">
              <Link href="/access-details">
                <Button
                  variant="outline"
                  className="cursor-pointer w-fit font-bold"
                >
                  ← Back
                </Button>
              </Link>
              <Button
                className="cursor-pointer bg-[#235FE7] w-fit font-bold"
                onClick={() => setSubmitted(true)}
              >
                Submit Request
              </Button>
            </div>

            {/* Sign in */}
            <div className="text-center">
              <p className="text-[#747376] text-sm">
                Already have an account?{" "}
                <span className="text-blue-700">
                  <Link href="/login">Sign in</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ReviewAndSubmit;
