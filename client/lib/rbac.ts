export type AppRole = "end_user" | "supervisor" | "ict_officer" | "ict_admin";

export type RoutePath =
  | "/overview"
  | "/assets"
  | "/tickets"
  | "/assignments"
  | "/reports"
  | "/settings";

const ROUTE_ACCESS: Record<AppRole, RoutePath[]> = {
  end_user: ["/overview", "/tickets"],
  supervisor: ["/overview", "/tickets", "/reports"],
  ict_officer: ["/overview", "/assets", "/tickets", "/assignments", "/reports"],
  ict_admin: [
    "/overview",
    "/assets",
    "/tickets",
    "/assignments",
    "/reports",
    "/settings",
  ],
};

export function normalizeRole(rawRole?: string): AppRole {
  const value = (rawRole || "").trim().toLowerCase();

  if (
    value === "ict administrator" ||
    value === "administrator" ||
    value === "admin" ||
    value === "ict_admin"
  ) {
    return "ict_admin";
  }

  if (
    value === "ict officer" ||
    value === "officer" ||
    value === "ict_officer"
  ) {
    return "ict_officer";
  }

  if (value === "supervisor" || value === "hod") {
    return "supervisor";
  }

  return "end_user";
}

export function canAccessRoute(role: AppRole, path: string): boolean {
  return ROUTE_ACCESS[role].includes(path as RoutePath);
}

export function getFirstAllowedRoute(role: AppRole): RoutePath {
  return ROUTE_ACCESS[role][0];
}

export function getAllowedRoutes(role: AppRole): RoutePath[] {
  return ROUTE_ACCESS[role];
}

export function getRoleLabel(role: AppRole): string {
  if (role === "ict_admin") return "ICT Administrator";
  if (role === "ict_officer") return "ICT Officer";
  if (role === "supervisor") return "Supervisor";
  return "End User";
}

export function canRegisterAsset(role: AppRole): boolean {
  return role === "ict_officer" || role === "ict_admin";
}

export function canManageAssignments(role: AppRole): boolean {
  return role === "ict_officer" || role === "ict_admin";
}

export function canResolveTickets(role: AppRole): boolean {
  return role === "ict_officer" || role === "ict_admin";
}

export function canViewSettings(role: AppRole): boolean {
  return role === "ict_admin";
}
