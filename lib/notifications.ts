"use client";

import { useEffect, useMemo, useState } from "react";

export type AppNotificationType = "ticket" | "asset" | "auth" | "system";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  createdAt: string;
  read: boolean;
};

const STORAGE_KEY = "ictams.notifications";
const NOTIFICATION_EVENT = "ictams:notifications-changed";

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Welcome to ICTAMS",
    message: "Track assets, tickets, and assignments from one dashboard.",
    type: "system",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function dispatchChanged() {
  if (!canUseBrowserStorage()) return;
  window.dispatchEvent(new Event(NOTIFICATION_EVENT));
}

export function readNotifications(): AppNotification[] {
  if (!canUseBrowserStorage()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_NOTIFICATIONS),
    );
    return DEFAULT_NOTIFICATIONS;
  }

  try {
    const parsed = JSON.parse(raw) as AppNotification[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeNotifications(notifications: AppNotification[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  dispatchChanged();
}

export function addNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "read">,
) {
  if (!canUseBrowserStorage()) return;

  const existing = readNotifications();
  const next: AppNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  };

  writeNotifications([next, ...existing].slice(0, 50));
}

export function markNotificationAsRead(id: string) {
  const existing = readNotifications();
  const updated = existing.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification,
  );
  writeNotifications(updated);
}

export function markAllNotificationsAsRead() {
  const existing = readNotifications();
  const updated = existing.map((notification) => ({
    ...notification,
    read: true,
  }));
  writeNotifications(updated);
}

export function clearNotifications() {
  if (!canUseBrowserStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  dispatchChanged();
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!canUseBrowserStorage()) return;

    const sync = () => setItems(readNotifications());
    queueMicrotask(sync);

    window.addEventListener("storage", sync);
    window.addEventListener(NOTIFICATION_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(NOTIFICATION_EVENT, sync);
    };
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  return { items, unreadCount };
}
