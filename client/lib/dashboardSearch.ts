"use client";

import { useEffect, useState } from "react";

const DASHBOARD_SEARCH_EVENT = "ictams:dashboard-search";
const DASHBOARD_SEARCH_KEY = "ictams.dashboard.search";

export function publishDashboardSearch(query: string) {
  if (typeof window === "undefined") return;

  const trimmed = query.trim();
  window.sessionStorage.setItem(DASHBOARD_SEARCH_KEY, trimmed);
  window.dispatchEvent(
    new CustomEvent<string>(DASHBOARD_SEARCH_EVENT, { detail: trimmed }),
  );
}

export function useDashboardSearch() {
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(DASHBOARD_SEARCH_KEY) || "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onSearch = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setQuery(customEvent.detail || "");
    };

    window.addEventListener(DASHBOARD_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(DASHBOARD_SEARCH_EVENT, onSearch);
  }, []);

  return query;
}
