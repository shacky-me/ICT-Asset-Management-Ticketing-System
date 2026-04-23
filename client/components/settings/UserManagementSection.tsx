"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getAllUsers,
  updateUserRole,
  type ApiSystemUser,
} from "@/lib/apiClient";
import { useCurrentUser } from "@/lib/session";
import { Shield, User } from "lucide-react";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleDateString();
}

const UserManagementSection = () => {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<ApiSystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = currentUser?.role === "ICT Administrator";

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getAllUsers();
        if (!cancelled) {
          setUsers(data.users);
          setStatusMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(
            error instanceof Error ? error.message : "Failed to load users",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const handleRoleChange = async (user: ApiSystemUser) => {
    const newRole =
      user.role === "ICT Administrator" ? "ICT_OFFICER" : "ICT_ADMIN";
    const confirmMessage =
      newRole === "ICT_ADMIN"
        ? `Promote ${user.fullName} to ICT Administrator?`
        : `Demote ${user.fullName} to ICT Officer?`;

    if (!window.confirm(confirmMessage)) return;

    setUpdatingUserId(user.id);
    setStatusMessage("");

    try {
      const result = await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, role: result.user.role } : u,
        ),
      );
      setStatusMessage(`${user.fullName}'s role updated successfully`);
    } catch (error) {
      const detail =
        error instanceof Error && error.message ? ` ${error.message}` : "";
      setStatusMessage(`Unable to update ${user.fullName}'s role.${detail}`);
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

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">User Management</p>
        <p className="text-xs text-gray-400">Manage system user roles</p>
      </div>

      {statusMessage && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
            statusMessage.includes("successfully")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage}
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

      {isLoading ? (
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
                        user.id === currentUser?.id
                      }
                      className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                        updatingUserId === user.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : user.id === currentUser?.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : user.role === "ICT Administrator"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {updatingUserId === user.id
                        ? "Updating..."
                        : user.id === currentUser?.id
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
  );
};

export default UserManagementSection;
