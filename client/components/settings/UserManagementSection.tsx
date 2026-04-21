"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveAccessRequest,
  getPendingAccessRequests,
  type PendingAccessRequest,
} from "@/lib/apiClient";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString();
}

const UserManagementSection = () => {
  const [requests, setRequests] = useState<PendingAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const pendingRequests = await getPendingAccessRequests();
        if (!cancelled) {
          setRequests(pendingRequests);
          setStatusMessage("");
        }
      } catch {
        if (!cancelled) {
          setStatusMessage("Failed to load pending access requests.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleApprove = async (request: PendingAccessRequest) => {
    setActiveRequestId(request.id);
    setStatusMessage("");

    try {
      await approveAccessRequest(request.id);
      setRequests((prev) => prev.filter((item) => item.id !== request.id));
      setStatusMessage(
        `Approved ${request.fullName}. Temporary password email has been sent to ${request.email}.`,
      );
    } catch (error) {
      const detail =
        error instanceof Error && error.message ? ` ${error.message}` : "";
      setStatusMessage(
        `Unable to approve ${request.fullName} right now. Please try again.${detail}`,
      );
    } finally {
      setActiveRequestId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">
          Pending Access Requests
        </p>
        <p className="text-xs text-gray-400">
          Approve a request to create a user account and email a temporary
          password.
        </p>
      </div>

      {isLoading ? (
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">Loading pending requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">No pending access requests.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {requests.map((request) => {
            const approving = activeRequestId === request.id;
            return (
              <div
                key={request.id}
                className="px-6 py-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {request.fullName}
                  </p>
                  <p className="text-xs text-gray-600">{request.email}</p>
                  <p className="text-xs text-gray-500">
                    Staff No: {request.staffNo} | {request.jobTitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    Department: {request.department} | Role:{" "}
                    {request.roleRequested}
                  </p>
                  {request.reason && (
                    <p className="text-xs text-gray-500">
                      Reason: {request.reason}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    Submitted: {formatDate(request.createdAt)}
                  </p>
                </div>
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={approving}
                  className="bg-[#235FE7] hover:bg-[#1a4fd6] text-xs"
                >
                  {approving ? "Approving..." : "Approve"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {statusMessage && (
        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-700">{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default UserManagementSection;
