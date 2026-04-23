"use client";

export const ASSIGNMENTS_CHANGED_EVENT = "ictams:assignments-changed";

export function publishAssignmentsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ASSIGNMENTS_CHANGED_EVENT));
}
