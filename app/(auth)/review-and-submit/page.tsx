"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/app/assets/Logo.svg";
import {
  CheckCircle2,
  User,
  Briefcase,
  Mail,
  Building2,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { submitAccessRequest } from "@/lib/apiClient";

const ROLE_LABELS: Record<string, string> = {
  staff: "End User — All Departments",
  supervisor: "Supervisor / HOD",
  officer: "ICT Officer",
  administrator: "ICT Administrator",
};

const ROLE_COLORS: Record<string, { text: string; bg: string }> = {
  staff: { text: "text-[#235FE7]", bg: "bg-[#8BA6EC]/20" },
  supervisor: { text: "text-[#875AC3]", bg: "bg-[#E6D5F8]/60" },
  officer: { text: "text-[#039b27]", bg: "bg-[#D4EDDA]" },
  administrator: { text: "text-[#B66231]", bg: "bg-[#FFF3CD]" },
};

function getLoadingLabel(progress: number): string {
  if (progress < 30) return "Submitting your request…";
  if (progress < 65) return "Verifying your details…";
  if (progress < 90) return "Creating your account…";
  return "Almost done…";
}

function mapUiRoleToBackendRole(role: string): "ICT_OFFICER" | "ICT_ADMIN" {
  const normalizedRole = role.trim().toLowerCase();
  if (normalizedRole.includes("admin")) return "ICT_ADMIN";
  return "ICT_OFFICER";
}

const ReviewAndSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const [personalDetails, setPersonalDetails] = useState({
    fullName: "",
    staffNumber: "",
    email: "",
    department: "",
    jobTitle: "",
  });

  const [accessRequest, setAccessRequest] = useState({
    role: "",
    reason: "",
  });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const savedPersonal = localStorage.getItem("request_access_step1");
    const savedAccess = localStorage.getItem("accessDetails");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedPersonal) setPersonalDetails(JSON.parse(savedPersonal));
    if (savedAccess) setAccessRequest(JSON.parse(savedAccess));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const crawlTo = (target: number, ease: number, ms: number): Promise<void> =>
    new Promise((resolve) => {
      let val = progress;
      const id = setInterval(() => {
        val += (target - val) * ease;
        setProgress(val);
        if (val >= target - 0.5) {
          clearInterval(id);
          setProgress(target);
          resolve();
        }
      }, ms);
      intervalRef.current = id;
    });

  const handleSubmit = async () => {
    setIsLoading(true);
    setProgress(0);
    setSubmitError("");

    await crawlTo(30, 0.12, 30);
    await crawlTo(65, 0.04, 40);
    await new Promise((res) => setTimeout(res, 600));
    await crawlTo(90, 0.12, 25);
    await new Promise((res) => setTimeout(res, 400));
    await crawlTo(100, 0.3, 20);
    await new Promise((res) => setTimeout(res, 300));

    if (!personalDetails.email) {
      setSubmitError("Email is required to submit this request.");
      setIsLoading(false);
      return;
    }

    try {
      await submitAccessRequest({
        fullName: personalDetails.fullName || personalDetails.email,
        staffNumber: personalDetails.staffNumber,
        jobTitle: personalDetails.jobTitle || "Staff",
        email: personalDetails.email,
        department: personalDetails.department || "ICT Department",
        role: accessRequest.role || "staff",
        roleRequested: mapUiRoleToBackendRole(accessRequest.role || "staff"),
        reason: accessRequest.reason,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.toLowerCase().includes("already submitted")) {
        localStorage.removeItem("request_access_step1");
        localStorage.removeItem("accessDetails");
        setIsLoading(false);
        router.push("/pending-approval");
        return;
      }

      setSubmitError(
        message || "Unable to submit request to the server. Please try again.",
      );
      setIsLoading(false);
      return;
    }

    localStorage.removeItem("request_access_step1");
    localStorage.removeItem("accessDetails");
    setIsLoading(false);
    router.push("/pending-approval");
  };

  const roleColors = ROLE_COLORS[accessRequest.role] ?? {
    text: "text-[#235FE7]",
    bg: "bg-blue-50",
  };
  const roleLabel = ROLE_LABELS[accessRequest.role] ?? accessRequest.role;

  return (
    <div className="w-lg mx-auto my-16">
      <div className="bg-[#fefefe] h-[80vh] flex flex-col border border-gray-200 rounded-lg shadow-lg shadow-gray-200">
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-16 py-6 space-y-5">
          {/* Personal Details */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                Personal Details
              </p>
              <Link
                href="/personal-info"
                className="text-xs text-[#235FE7] hover:underline font-medium"
              >
                Edit
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  icon: User,
                  label: "Full Name",
                  value: personalDetails.fullName,
                },
                {
                  icon: Hash,
                  label: "Payroll No.",
                  value: personalDetails.staffNumber,
                },
                { icon: Mail, label: "Email", value: personalDetails.email },
                {
                  icon: Building2,
                  label: "Department",
                  value: personalDetails.department,
                },
                {
                  icon: Briefcase,
                  label: "Job Title",
                  value: personalDetails.jobTitle,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3 gap-4"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                  <p className="text-sm font-medium text-right truncate max-w-[55%]">
                    {value || <span className="text-gray-300 italic">—</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Access Request */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
                Access Request
              </p>
              <Link
                href="/access-details"
                className="text-xs text-[#235FE7] hover:underline font-medium"
              >
                Edit
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-sm text-gray-500">Role</p>
                </div>
                {roleLabel ? (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors.text} ${roleColors.bg}`}
                  >
                    {roleLabel}
                  </span>
                ) : (
                  <span className="text-gray-300 italic text-sm">—</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-4 py-3">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="text-sm font-medium leading-relaxed">
                  {accessRequest.reason || (
                    <span className="text-gray-300 italic">—</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-4 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              What happens after you submit
            </p>
            {[
              "Your request is sent to an ICT administrator for review",
              "Once approved, your account is created on the server",
              `A temporary password is emailed to ${personalDetails.email || "your email"} after approval`,
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#235FE7] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Progress bar — visible only while loading */}
          <div
            className={`w-full h-1 rounded-full overflow-hidden bg-gray-100 transition-opacity duration-300 ${
              isLoading ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            <div
              className="h-full bg-[#235FE7] rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 25ms linear",
              }}
            />
          </div>

          {/* CTA */}
          <div className="w-full flex items-center justify-between">
            <Link href="/access-details">
              <Button
                variant="outline"
                className="cursor-pointer w-fit font-bold"
                disabled={isLoading}
              >
                ← Back
              </Button>
            </Link>
            <Button
              className="cursor-pointer bg-[#235FE7] w-fit font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-40 justify-center"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="text-sm">{getLoadingLabel(progress)}</span>
                </>
              ) : (
                "Submit Request →"
              )}
            </Button>
          </div>

          {submitError && (
            <p className="text-xs text-amber-700">{submitError}</p>
          )}

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
  );
};

export default ReviewAndSubmit;
