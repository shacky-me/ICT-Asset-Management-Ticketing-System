import {
  LayoutDashboard,
  Monitor,
  Ticket,
  Users,
  BarChart2,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number; // optional notification count
};

export const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Assets",
    href: "/assets",
    icon: Monitor,
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: Ticket,
    badge: 8, // TODO: replace with dynamic count from API
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
