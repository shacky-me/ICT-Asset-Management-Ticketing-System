"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  staffNumber?: string;
  initials: string;
};

const LOCAL_STORAGE_KEY = "ictams.currentUser";
const SESSION_STORAGE_KEY = "ictams.currentUser.session";
const LOCAL_AUTH_TOKEN_KEY = "ictams.authToken";
const SESSION_AUTH_TOKEN_KEY = "ictams.authToken.session";
const USER_EVENT = "ictams:user-changed";

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function getInitials(nameOrEmail: string): string {
  const source = nameOrEmail.trim();
  if (!source) return "NA";

  if (source.includes("@")) {
    const local = source.split("@")[0] || "NA";
    const parts = local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .filter(Boolean);

    if (parts.length >= 2) return `${parts[0]}${parts[1]}`;
    return (parts[0] ?? "NA").slice(0, 2);
  }

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function normalizeUser(
  input: Partial<CurrentUser> & { email: string },
): CurrentUser {
  const name = input.name?.trim() || input.email.split("@")[0] || "User";
  const initials = getInitials(input.initials?.trim() || name || input.email);
  const normalizedEmail = input.email.trim().toLowerCase();

  return {
    id: input.id || `usr-${normalizedEmail}`,
    name,
    email: normalizedEmail,
    role: input.role || "Staff",
    department: input.department || "ICT Department",
    staffNumber: input.staffNumber,
    initials,
  };
}

function dispatchUserChanged() {
  if (!canUseBrowserStorage()) return;
  window.dispatchEvent(new Event(USER_EVENT));
}

export function readCurrentUser(): CurrentUser | null {
  if (!canUseBrowserStorage()) return null;

  const rawSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  const rawLocal = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  const raw = rawSession || rawLocal;

  if (!raw) return null;

  try {
    return normalizeUser(JSON.parse(raw) as CurrentUser);
  } catch {
    return null;
  }
}

export function saveCurrentUser(
  user: Partial<CurrentUser> & { email: string },
  options?: { persistent?: boolean },
): CurrentUser {
  if (!canUseBrowserStorage()) {
    return normalizeUser(user);
  }

  const normalized = normalizeUser(user);
  const targetStorage = options?.persistent
    ? window.localStorage
    : window.sessionStorage;
  const targetKey = options?.persistent
    ? LOCAL_STORAGE_KEY
    : SESSION_STORAGE_KEY;

  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  targetStorage.setItem(targetKey, JSON.stringify(normalized));
  dispatchUserChanged();
  return normalized;
}

export function clearCurrentUser() {
  if (!canUseBrowserStorage()) return;

  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(LOCAL_AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_AUTH_TOKEN_KEY);
  dispatchUserChanged();
}

export function readAuthToken(): string | null {
  if (!canUseBrowserStorage()) return null;

  return (
    window.sessionStorage.getItem(SESSION_AUTH_TOKEN_KEY) ||
    window.localStorage.getItem(LOCAL_AUTH_TOKEN_KEY)
  );
}

export function saveAuthToken(
  token: string,
  options?: { persistent?: boolean },
) {
  if (!canUseBrowserStorage()) return;

  const targetStorage = options?.persistent
    ? window.localStorage
    : window.sessionStorage;
  const targetKey = options?.persistent
    ? LOCAL_AUTH_TOKEN_KEY
    : SESSION_AUTH_TOKEN_KEY;

  window.localStorage.removeItem(LOCAL_AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_AUTH_TOKEN_KEY);
  targetStorage.setItem(targetKey, token);
}

export function clearAuthToken() {
  if (!canUseBrowserStorage()) return;

  window.localStorage.removeItem(LOCAL_AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_AUTH_TOKEN_KEY);
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    if (!canUseBrowserStorage()) return;

    const sync = () => setUser(readCurrentUser());
    queueMicrotask(sync);

    window.addEventListener("storage", sync);
    window.addEventListener(USER_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(USER_EVENT, sync);
    };
  }, []);

  return user;
}
