import type { ComponentType, SVGProps } from "react";
import type { AuthUser } from "../features/auth/authApi";
import {
  BellIcon,
  ClipboardListIcon,
  HomeIcon,
  InboxIcon,
  PlusCircleIcon,
  UserIcon,
} from "../components/ui/Icons";

export type UserRole = AuthUser["role"];

export type NavItem = {
  label: string;
  mobileLabel: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mobilePrimary: boolean;
  end?: boolean;
};

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer";
    case "EMPLOYEE":
      return "/employee";
    case "ADMIN":
      return "/admin";
  }
}

export function getNotificationsPathForRole(role: UserRole): string | null {
  switch (role) {
    case "CUSTOMER":
      return "/notifications";
    case "EMPLOYEE":
      return "/employee/notifications";
    case "ADMIN":
      return null;
  }
}

export const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  CUSTOMER: [
    {
      label: "Home",
      mobileLabel: "Home",
      to: "/customer",
      icon: HomeIcon,
      mobilePrimary: true,
      end: true,
    },
    {
      label: "My inquiries",
      mobileLabel: "My inquiries",
      to: "/inquiries",
      icon: InboxIcon,
      mobilePrimary: true,
      end: true,
    },
    {
      label: "New inquiry",
      mobileLabel: "New inquiry",
      to: "/inquiries/new",
      icon: PlusCircleIcon,
      mobilePrimary: true,
    },
    {
      label: "Notifications",
      mobileLabel: "Notifications",
      to: "/notifications",
      icon: BellIcon,
      mobilePrimary: false,
    },
    {
      label: "Account",
      mobileLabel: "Account",
      to: "/account",
      icon: UserIcon,
      mobilePrimary: false,
    },
  ],
  EMPLOYEE: [
    {
      label: "Home",
      mobileLabel: "Home",
      to: "/employee",
      icon: HomeIcon,
      mobilePrimary: true,
      end: true,
    },
    {
      label: "Assigned inquiries",
      mobileLabel: "Assigned",
      to: "/employee/inquiries",
      icon: ClipboardListIcon,
      mobilePrimary: true,
    },
    {
      label: "Notifications",
      mobileLabel: "Notifications",
      to: "/employee/notifications",
      icon: BellIcon,
      mobilePrimary: false,
    },
    {
      label: "Account",
      mobileLabel: "Account",
      to: "/account",
      icon: UserIcon,
      mobilePrimary: false,
    },
  ],
  ADMIN: [
    {
      label: "Home",
      mobileLabel: "Home",
      to: "/admin",
      icon: HomeIcon,
      mobilePrimary: true,
      end: true,
    },
    {
      label: "Inquiries",
      mobileLabel: "Inquiries",
      to: "/admin/inquiries",
      icon: ClipboardListIcon,
      mobilePrimary: true,
    },
    {
      label: "Account",
      mobileLabel: "Account",
      to: "/account",
      icon: UserIcon,
      mobilePrimary: false,
    },
  ],
};

export function getTimeGreeting(fullName?: string | null): string {
  const hour = new Date().getHours();
  const base =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  const firstName = fullName?.trim().split(/\s+/)[0];
  return firstName ? `${base}, ${firstName}` : base;
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/customer") return "Dashboard";
  if (pathname === "/inquiries") return "My inquiries";
  if (pathname === "/inquiries/new") return "New inquiry";
  if (pathname.startsWith("/inquiries/")) return "Inquiry details";
  if (pathname === "/notifications") return "Notifications";
  if (pathname === "/employee") return "Dashboard";
  if (pathname === "/employee/inquiries") return "Assigned inquiries";
  if (pathname.startsWith("/employee/inquiries/")) return "Assigned inquiry";
  if (pathname === "/employee/notifications") return "Notifications";
  if (pathname === "/admin") return "Admin dashboard";
  if (pathname === "/admin/inquiries") return "Admin inquiries";
  if (pathname === "/account") return "Account";
  return "InquiryFlow";
}

