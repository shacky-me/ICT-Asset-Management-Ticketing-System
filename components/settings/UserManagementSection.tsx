"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCurrentUser, useCurrentUser } from "@/lib/session";
import {
  listProvisionedAccounts,
  ManagedAccount,
  updateProvisionedAccount,
} from "@/lib/authAccounts";
import { normalizeRole } from "@/lib/rbac";

type AdminManagedAccount = ManagedAccount & {
  sessionOnly?: boolean;
};

type FormState = {
  name: string;
  staffNumber: string;
  department: string;
  role: string;
  mustResetPassword: boolean;
};

function accountToForm(account: ManagedAccount): FormState {
  return {
    name: account.name,
    staffNumber: account.staffNumber || "",
    department: account.department,
    role: account.role,
    mustResetPassword: account.mustResetPassword,
  };
}

const UserManagementSection = () => {
  const currentUser = useCurrentUser();
  const [selectedEmail, setSelectedEmail] = useState("");
  const [drafts, setDrafts] = useState<Record<string, FormState>>({});
  const [statusMessage, setStatusMessage] = useState("");

  const accounts = useMemo(() => {
    const nextAccounts = listProvisionedAccounts();
    const currentEmail = currentUser?.email?.toLowerCase();
    const hasCurrentUserInProvisioned = currentEmail
      ? nextAccounts.some((item) => item.email === currentEmail)
      : false;

    const mergedAccounts: AdminManagedAccount[] = [...nextAccounts];
    if (currentUser && currentEmail && !hasCurrentUserInProvisioned) {
      mergedAccounts.unshift({
        email: currentEmail,
        name: currentUser.name,
        staffNumber: currentUser.staffNumber,
        department: currentUser.department,
        role: normalizeRole(currentUser.role),
        mustResetPassword: false,
        createdAt: new Date().toISOString(),
        sessionOnly: true,
      });
    }

    return mergedAccounts;
  }, [currentUser]);

  const preferredEmail = currentUser?.email?.toLowerCase();
  const effectiveSelectedEmail =
    selectedEmail ||
    accounts.find((item) => item.email === preferredEmail)?.email ||
    accounts[0]?.email ||
    "";

  const selectedAccount = useMemo(
    () =>
      accounts.find((item) => item.email === effectiveSelectedEmail) || null,
    [accounts, effectiveSelectedEmail],
  );

  const form = selectedAccount
    ? drafts[effectiveSelectedEmail] || accountToForm(selectedAccount)
    : {
        name: "",
        staffNumber: "",
        department: "",
        role: "end_user",
        mustResetPassword: false,
      };

  const isSelf =
    Boolean(selectedAccount) &&
    selectedAccount?.email === currentUser?.email?.toLowerCase();

  const onSelect = (email: string) => {
    setSelectedEmail(email);
    setStatusMessage("");
  };

  const updateForm = (patch: Partial<FormState>) => {
    if (!selectedAccount) return;

    setDrafts((prev) => {
      const existing =
        prev[effectiveSelectedEmail] || accountToForm(selectedAccount);
      return {
        ...prev,
        [effectiveSelectedEmail]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const onSave = () => {
    if (!selectedAccount) return;

    if (selectedAccount.sessionOnly) {
      const persistent =
        typeof window !== "undefined" &&
        Boolean(window.localStorage.getItem("ictams.currentUser"));

      saveCurrentUser(
        {
          email: selectedAccount.email,
          name: form.name,
          staffNumber: form.staffNumber || undefined,
          department: form.department,
          role: form.role,
        },
        { persistent },
      );

      const refreshedAccounts = accounts.map((account) =>
        account.email === selectedAccount.email
          ? {
              ...account,
              name: form.name,
              staffNumber: form.staffNumber || undefined,
              department: form.department,
              role: form.role,
            }
          : account,
      );
      setDrafts((prev) => ({
        ...prev,
        [selectedAccount.email]: accountToForm(
          refreshedAccounts.find(
            (item) => item.email === selectedAccount.email,
          ) || selectedAccount,
        ),
      }));
      setStatusMessage("Your profile was updated.");
      return;
    }

    const result = updateProvisionedAccount(selectedAccount.email, {
      name: form.name,
      staffNumber: form.staffNumber,
      department: form.department,
      role: form.role,
      mustResetPassword: form.mustResetPassword,
    });

    if (result.status !== "updated") {
      setStatusMessage("Unable to update this user right now.");
      return;
    }

    setSelectedEmail(result.account.email);
    setDrafts((prev) => ({
      ...prev,
      [result.account.email]: accountToForm(result.account),
    }));
    setStatusMessage(isSelf ? "Your profile was updated." : "User updated.");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">User Administration</p>
        <p className="text-xs text-gray-400">
          ICT administrator controls for updating user profile details and
          access roles.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">No provisioned users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12">
          <div className="col-span-5 border-r border-gray-100 max-h-80 overflow-y-auto">
            {accounts.map((account) => {
              const active = account.email === selectedEmail;
              const isCurrent =
                account.email === currentUser?.email?.toLowerCase();

              return (
                <button
                  key={account.email}
                  onClick={() => onSelect(account.email)}
                  className={`w-full text-left px-5 py-3 border-b border-gray-100 transition-colors ${
                    active ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {account.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {account.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] rounded-full border border-gray-200 px-2 py-0.5 text-gray-600">
                      {account.role}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-600">
                        You
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="col-span-7 px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Full Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm({ name: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Staff Number</label>
                <Input
                  value={form.staffNumber}
                  onChange={(event) =>
                    updateForm({ staffNumber: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Department</label>
                <Input
                  value={form.department}
                  onChange={(event) =>
                    updateForm({ department: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => updateForm({ role: event.target.value })}
                  className="h-8 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm"
                >
                  <option value="end_user">End User</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="ict_officer">ICT Officer</option>
                  <option value="ict_admin">ICT Administrator</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={form.mustResetPassword}
                disabled={selectedAccount?.sessionOnly}
                onChange={(event) =>
                  updateForm({ mustResetPassword: event.target.checked })
                }
              />
              Require password reset on next login
            </label>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500">
                {isSelf
                  ? "Editing your account"
                  : "Select a user from the list to edit details"}
              </p>
              <Button
                onClick={onSave}
                className="bg-[#235FE7] hover:bg-[#1a4fd6] text-sm"
              >
                Save Changes
              </Button>
            </div>

            {statusMessage && (
              <p className="text-xs text-green-600">{statusMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementSection;
