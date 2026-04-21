"use client";

import { CurrentUser, getInitials } from "@/lib/session";
import { readCurrentUser, saveCurrentUser } from "@/lib/session";
import { normalizeRole, getRoleLabel } from "@/lib/rbac";

type ProvisionedAccount = {
  email: string;
  name: string;
  staffNumber?: string;
  department: string;
  role: string;
  tempPassword: string;
  password?: string;
  mustResetPassword: boolean;
  createdAt: string;
};

export type ManagedAccount = {
  email: string;
  name: string;
  staffNumber?: string;
  department: string;
  role: string;
  mustResetPassword: boolean;
  createdAt: string;
};

type AuthenticateResult =
  | { status: "not_found" }
  | { status: "invalid_password" }
  | { status: "requires_password_reset"; email: string }
  | { status: "authenticated"; user: CurrentUser };

const ACCOUNTS_KEY = "ictams.provisionedAccounts";
const RESET_EMAIL_KEY = "ictams.reset.requiredEmail";
const RESET_REMEMBER_ME_KEY = "ictams.reset.rememberMe";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readAccounts(): ProvisionedAccount[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProvisionedAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: ProvisionedAccount[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function generateTemporaryPassword() {
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `Temp@${suffix}`;
}

function mapAccountToCurrentUser(account: ProvisionedAccount): CurrentUser {
  const role = normalizeRole(account.role);
  return {
    id: `usr-${account.email}`,
    name: account.name,
    email: account.email,
    role: getRoleLabel(role),
    department: account.department,
    staffNumber: account.staffNumber,
    initials: getInitials(account.name || account.email),
  };
}

function mapAccountForManagement(account: ProvisionedAccount): ManagedAccount {
  return {
    email: account.email,
    name: account.name,
    staffNumber: account.staffNumber,
    department: account.department,
    role: normalizeRole(account.role),
    mustResetPassword: account.mustResetPassword,
    createdAt: account.createdAt,
  };
}

export function listProvisionedAccounts(): ManagedAccount[] {
  return readAccounts().map(mapAccountForManagement);
}

export function updateProvisionedAccount(
  email: string,
  updates: {
    name: string;
    staffNumber?: string;
    department: string;
    role: string;
    mustResetPassword?: boolean;
  },
) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);

  if (!account) {
    return { status: "not_found" as const };
  }

  account.name = updates.name.trim() || account.name;
  account.staffNumber = updates.staffNumber?.trim() || undefined;
  account.department = updates.department.trim() || account.department;
  account.role = normalizeRole(updates.role);
  if (typeof updates.mustResetPassword === "boolean") {
    account.mustResetPassword = updates.mustResetPassword;
  }

  writeAccounts(accounts);

  const current = readCurrentUser();
  if (current?.email?.toLowerCase() === account.email.toLowerCase()) {
    const persistent =
      typeof window !== "undefined" &&
      Boolean(window.localStorage.getItem("ictams.currentUser"));
    saveCurrentUser(mapAccountToCurrentUser(account), { persistent });
  }

  return {
    status: "updated" as const,
    account: mapAccountForManagement(account),
  };
}

export function provisionAccessAccount(payload: {
  email: string;
  name: string;
  staffNumber?: string;
  department: string;
  role: string;
}) {
  const tempPassword = generateTemporaryPassword();
  const next: ProvisionedAccount = {
    email: payload.email.trim().toLowerCase(),
    name: payload.name,
    staffNumber: payload.staffNumber,
    department: payload.department,
    role: payload.role,
    tempPassword,
    mustResetPassword: true,
    createdAt: new Date().toISOString(),
  };

  const existing = readAccounts().filter(
    (account) => account.email !== next.email,
  );

  writeAccounts([next, ...existing]);
  return next;
}

export function authenticateProvisionedAccount(
  identifier: string,
  password: string,
): AuthenticateResult {
  const email = identifier.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email === email);

  if (!account) return { status: "not_found" };

  if (account.mustResetPassword) {
    if (password !== account.tempPassword) {
      return { status: "invalid_password" };
    }

    return { status: "requires_password_reset", email: account.email };
  }

  if (!account.password || account.password !== password) {
    return { status: "invalid_password" };
  }

  return { status: "authenticated", user: mapAccountToCurrentUser(account) };
}

export function setPendingPasswordResetEmail(
  email: string,
  rememberMe: boolean,
) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(RESET_EMAIL_KEY, email);
  window.sessionStorage.setItem(RESET_REMEMBER_ME_KEY, rememberMe ? "1" : "0");
}

export function getPendingPasswordResetEmail() {
  if (!canUseStorage()) return null;
  return window.sessionStorage.getItem(RESET_EMAIL_KEY);
}

export function getPendingPasswordResetRememberMe() {
  if (!canUseStorage()) return false;
  return window.sessionStorage.getItem(RESET_REMEMBER_ME_KEY) === "1";
}

export function clearPendingPasswordResetContext() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
  window.sessionStorage.removeItem(RESET_REMEMBER_ME_KEY);
}

export function completeFirstLoginPasswordReset(newPassword: string) {
  const email = getPendingPasswordResetEmail();
  if (!email) return null;

  const accounts = readAccounts();
  const account = accounts.find((item) => item.email === email);
  if (!account) return null;

  account.password = newPassword;
  account.mustResetPassword = false;
  writeAccounts(accounts);
  clearPendingPasswordResetContext();

  return mapAccountToCurrentUser(account);
}

export function getProvisionedTempPassword(email: string) {
  const normalized = email.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email === normalized);
  return account?.tempPassword;
}
