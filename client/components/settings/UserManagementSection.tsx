"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AccessRequestDecisionModal from "@/components/settings/AccessRequestDecisionModal";
import {
  approveAccessRequest,
  getPendingAccessRequests,
  getAllUsers,
  rejectAccessRequest,
  type PendingAccessRequest,
  updateUserRole,
  type ApiSystemUser,
} from "@/lib/apiClient";
import { useCurrentUser } from "@/lib/session";
import { Shield, User } from "lucide-react";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString();
}

const UserManagementSection = () => {
  const currentUser = useCurrentUser();
  const [requests, setRequests] = useState<PendingAccessRequest[]>([]);
  const [users, setUsers] = useState<ApiSystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [userStatusMessage, setUserStatusMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [decisionAction, setDecisionAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [decisionRequest, setDecisionRequest] =
    useState<PendingAccessRequest | null>(null);
  const [decisionReason, setDecisionReason] = useState("");

  const pageSize = 5;

  const isAdmin = currentUser?.role === "ICT Administrator";

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

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

    const loadUsers = async () => {
      if (!isAdmin) {
        setIsUsersLoading(false);
        return;
      }

      setIsUsersLoading(true);
      try {
        const data = await getAllUsers();
        if (!cancelled) {
          setUsers(data.users);
          setUserStatusMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setUserStatusMessage(
            error instanceof Error ? error.message : "Failed to load users",
          );
        }
      } finally {
        if (!cancelled) {
          setIsUsersLoading(false);
        }
      }
    };

    loadRequests();
    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const openDecisionModal = (
    action: "approve" | "reject",
    request: PendingAccessRequest,
  ) => {
    setDecisionAction(action);
    setDecisionRequest(request);
    setDecisionReason("");
  };

  const closeDecisionModal = () => {
    setDecisionAction(null);
    setDecisionRequest(null);
    setDecisionReason("");
  };

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
      closeDecisionModal();
    }
  };

  const handleReject = async (request: PendingAccessRequest) => {
    setActiveRequestId(request.id);
    setStatusMessage("");

    try {
      await rejectAccessRequest(request.id, decisionReason.trim());
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
      closeDecisionModal();
    }
  };

  const handleRoleChange = async (user: ApiSystemUser) => {
    const newRole =
      user.role === "ICT Administrator" ? "ICT_OFFICER" : "ICT_ADMIN";
    const confirmMessage =
      newRole === "ICT_ADMIN"
        ? `Promote ${user.fullName} to ICT Administrator?`
        : `Demote ${user.fullName} to ICT Officer?`;

    if (!window.confirm(confirmMessage)) return;

    setUpdatingUserId(user.id);
    setUserStatusMessage("");

    try {
      const result = await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: result.user.role } : u,
        ),
      );
      setUserStatusMessage(`${user.fullName}'s role updated successfully`);
    } catch (error) {
      const detail =
        error instanceof Error && error.message ? ` ${error.message}` : "";
      setUserStatusMessage(
        `Unable to update ${user.fullName}'s role.${detail}`,
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">User Management</p>
          <p className="text-xs text-gray-400">Admin only access</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            Only system administrators can manage user roles.
          </p>
        </div>
      </div>
    );
  }

  const normalizedRequestQuery = requestSearchQuery.trim().toLowerCase();
  const filteredRequests = requests.filter((request) => {
    if (!normalizedRequestQuery) return true;
    return (
      request.fullName.toLowerCase().includes(normalizedRequestQuery) ||
      request.email.toLowerCase().includes(normalizedRequestQuery) ||
      request.staffNo.toLowerCase().includes(normalizedRequestQuery)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
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
            Approve or reject requests quickly. Rejections can include an
            optional reason for the applicant.
          </p>
          <input
            value={requestSearchQuery}
            onChange={(event) => {
              setRequestSearchQuery(event.target.value);
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
            <p className="text-sm text-gray-600">
              No matching pending requests.
            </p>
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
                      onClick={() => openDecisionModal("reject", request)}
                      disabled={active}
                      className="bg-red-600 hover:bg-red-700 text-xs"
                    >
                      {active ? "Working..." : "Reject"}
                    </Button>
                    <Button
                      onClick={() => openDecisionModal("approve", request)}
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
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">User Management</p>
          <p className="text-xs text-gray-400">Manage system user roles</p>
        </div>

        {userStatusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
              userStatusMessage.includes("successfully")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {userStatusMessage}
          </div>
        )}

        <div className="px-6 py-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {isUsersLoading ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Staff No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{user.staffNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "ICT Administrator"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role === "ICT Administrator" ? (
                          <Shield size={12} />
                        ) : (
                          <User size={12} />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRoleChange(user)}
                        disabled={
                          updatingUserId === user.id ||
                          String(user.id) === currentUser?.id
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                          updatingUserId === user.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : String(user.id) === currentUser?.id
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : user.role === "ICT Administrator"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {updatingUserId === user.id
                          ? "Updating..."
                          : String(user.id) === currentUser?.id
                            ? "Current Admin"
                            : user.role === "ICT Administrator"
                              ? "Demote"
                              : "Promote"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AccessRequestDecisionModal
        isOpen={Boolean(decisionAction && decisionRequest)}
        action={decisionAction || "approve"}
        applicantName={decisionRequest?.fullName || ""}
        applicantEmail={decisionRequest?.email || ""}
        reason={decisionReason}
        onReasonChange={setDecisionReason}
        isLoading={Boolean(
          decisionRequest && activeRequestId === decisionRequest.id,
        )}
        onClose={closeDecisionModal}
        onConfirm={() => {
          if (!decisionRequest || !decisionAction) return;
          if (decisionAction === "approve") {
            void handleApprove(decisionRequest);
            return;
          }
          void handleReject(decisionRequest);
        }}
      />
    </div>
  );
};

export default UserManagementSection;
