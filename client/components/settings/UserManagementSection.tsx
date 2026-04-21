"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  approveAccessRequest,
  getPendingAccessRequests,
  rejectAccessRequest,
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
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 5;

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

  const handleReject = async (request: PendingAccessRequest) => {
    const reason = window.prompt(
      `Optional reason for rejecting ${request.fullName}:`,
      "",
    );

    if (reason === null) return;

    setActiveRequestId(request.id);
    setStatusMessage("");

    try {
      await rejectAccessRequest(request.id, reason.trim());
      setRequests((prev) => prev.filter((item) => item.id !== request.id));
      setStatusMessage(
        `Rejected ${request.fullName}. Applicant has been notified.`,
      );
    } catch (error) {
      const detail =
        error instanceof Error && error.message ? ` ${error.message}` : "";
      setStatusMessage(
        `Unable to reject ${request.fullName} right now. Please try again.${detail}`,
      );
    } finally {
      setActiveRequestId(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRequests = requests.filter((request) => {
    if (!normalizedQuery) return true;
    return (
      request.fullName.toLowerCase().includes(normalizedQuery) ||
      request.email.toLowerCase().includes(normalizedQuery) ||
      request.staffNo.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-900">
            Pending Access Requests
          </p>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {filteredRequests.length} pending
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Approve or reject requests quickly. Rejections can include an optional
          reason for the applicant.
        </p>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, or staff no..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">Loading pending requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">No matching pending requests.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {paginatedRequests.map((request) => {
            const active = activeRequestId === request.id;
            return (
              <div
                key={request.id}
                className="px-6 py-3.5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {request.fullName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {request.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.staffNo} • {request.department} •{" "}
                    {request.roleRequested}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {formatDate(request.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => handleReject(request)}
                    disabled={active}
                    className="bg-red-600 hover:bg-red-700 text-xs"
                  >
                    {active ? "Working..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleApprove(request)}
                    disabled={active}
                    className="bg-[#235FE7] hover:bg-[#1a4fd6] text-xs"
                  >
                    {active ? "Working..." : "Approve"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredRequests.length > pageSize && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              className="h-7 px-3 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              className="h-7 px-3 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
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
