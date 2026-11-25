import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { io } from "socket.io-client";

import coffeeNinjaLogo from "../../assets/coffee_ninja_logo.jpg";
import { baseApi } from "../../app/baseApi";
import { API_ORIGIN } from "../../config/env";
import {
  NAV_ITEMS_BY_ROLE,
  getNotificationsPathForRole,
  getPageTitle,
  getTimeGreeting,
  type UserRole,
} from "../../config/navigation";
import { useGetMeQuery, useLogoutMutation } from "../../features/auth/authApi";
import { useGetMyNotificationsQuery } from "../../features/notifications/notificationsApi";
import {
  BellIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  XIcon,
} from "../ui/Icons";
import { CenteredSpinner } from "../ui/LoadingState";

function useNotificationSync(userId: string, role: UserRole) {
  const dispatch = useDispatch();
  const hasNotifications = role === "CUSTOMER" || role === "EMPLOYEE";

  const { currentData: notifications, isError } = useGetMyNotificationsQuery(
    userId,
    { skip: !hasNotifications },
  );

  useEffect(() => {
    if (!hasNotifications) return;

    const socket = io(API_ORIGIN || undefined, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    });

    const refreshInbox = () => {
      dispatch(
        baseApi.util.invalidateTags([{ type: "Notification", id: userId }]),
      );
    };

    const refreshInboxAndMessages = () => {
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Notification", id: userId },
          "Message",
        ]),
      );
    };

    socket.on("notifications:ready", refreshInboxAndMessages);

    if (role === "CUSTOMER") {
      socket.on("employee-reply:created", refreshInboxAndMessages);
    } else if (role === "EMPLOYEE") {
      socket.on("notifications:changed", refreshInbox);
      socket.on("customer-reply:created", refreshInboxAndMessages);
    }

    socket.connect();

    return () => {
      socket.off("notifications:ready", refreshInboxAndMessages);
      socket.off("notifications:changed", refreshInbox);
      socket.off("employee-reply:created", refreshInboxAndMessages);
      socket.off("customer-reply:created", refreshInboxAndMessages);
      socket.disconnect();
    };
  }, [dispatch, hasNotifications, role, userId]);

  const unreadCount = !hasNotifications || isError
    ? 0
    : (notifications?.filter((item) => item.readAt === null).length ?? 0);

  return { unreadCount, hasNotifications };
}

function NotificationBell({
  to,
  unreadCount,
}: {
  to: string;
  unreadCount: number;
}) {
  return (
    <Link
      to={to}
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#315747] bg-[#103326] text-[#F5FAF7] transition-colors hover:border-[#6EE7A5]/60 hover:bg-[#143D2E]"
    >
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#6EE7A5] px-1.5 py-0.5 text-[11px] font-bold leading-none text-[#071B14]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function AuthenticatedShell({
  user,
}: {
  user: { id: string; fullName: string; role: UserRole };
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [moreOpenPath, setMoreOpenPath] = useState<string | null>(null);
  const moreOpen = moreOpenPath === location.pathname;
  const [logoutError, setLogoutError] = useState("");
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const closeSheetButtonRef = useRef<HTMLButtonElement>(null);
  const wasMoreOpenRef = useRef(false);

  const { unreadCount } = useNotificationSync(user.id, user.role);
  const notificationsPath = getNotificationsPathForRole(user.role);
  const navItems = NAV_ITEMS_BY_ROLE[user.role];
  const primaryMobileItems = navItems.filter((item) => item.mobilePrimary);
  const secondaryMobileItems = navItems.filter((item) => !item.mobilePrimary);

  const greeting = getTimeGreeting(user.fullName);
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    if (moreOpen) {
      wasMoreOpenRef.current = true;
      closeSheetButtonRef.current?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setMoreOpenPath(null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }

    if (wasMoreOpenRef.current) {
      wasMoreOpenRef.current = false;
      moreButtonRef.current?.focus();
    }
  }, [moreOpen]);

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout().unwrap();
      setMoreOpenPath(null);
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#071B14] text-[#F5FAF7] md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:h-full md:w-64 md:shrink-0 md:flex-col md:border-r md:border-[#315747] md:bg-[#0B241B]">
        <div className="flex items-center gap-3 border-b border-[#315747] px-5 py-4">
          <img
            src={coffeeNinjaLogo}
            alt="Coffee Ninja"
            className="h-9 w-9 rounded-lg border border-[#315747] object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#F5FAF7]">
              InquiryFlow
            </p>
            <p className="truncate text-xs uppercase tracking-wider text-[#BCD0C4]">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>

        <nav
          aria-label={`${user.role.toLowerCase()} navigation`}
          className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNotificationsItem = item.to === notificationsPath;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#17603F] text-white"
                      : "text-[#BCD0C4] hover:bg-[#103326] hover:text-[#F5FAF7]"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>

                {isNotificationsItem && unreadCount > 0 && (
                  <span className="rounded-full bg-[#6EE7A5] px-2 py-0.5 text-xs font-bold text-[#071B14]">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#315747] p-3">
          {logoutError && (
            <p role="alert" className="mb-2 text-xs text-rose-300">
              {logoutError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#BCD0C4] transition-colors hover:bg-[#d00f28] hover:text-[#F5FAF7] disabled:opacity-50"
          >
            <LogOutIcon className="h-4 w-4 shrink-0" />
            <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Desktop Header */}
        <header className="hidden shrink-0 items-center justify-between gap-4 border-b border-[#315747] bg-[#0B241B] px-6 py-4 md:flex">
          <div className="min-w-0">
            <p className="truncate text-sm text-[#BCD0C4]">{greeting}</p>
            <h2 className="truncate text-lg font-semibold text-[#F5FAF7]">
              {pageTitle}
            </h2>
          </div>

          {notificationsPath && (
            <NotificationBell to={notificationsPath} unreadCount={unreadCount} />
          )}
        </header>

        {/* Mobile Top Bar */}
        <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[#315747] bg-[#0B241B]/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#BCD0C4]">
              {greeting}
            </p>
            <p className="truncate text-base font-semibold text-[#F5FAF7]">
              {pageTitle}
            </p>
          </div>

          {notificationsPath && (
            <NotificationBell to={notificationsPath} unreadCount={unreadCount} />
          )}
        </header>

        {/* Page Content (scrolls independently; padded above fixed mobile nav + safe area) */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-8">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#315747] bg-[#0B241B] pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex items-stretch justify-around">
          {primaryMobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "text-[#6EE7A5]"
                      : "text-[#BCD0C4] hover:text-[#F5FAF7]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? "text-[#6EE7A5]" : ""
                      }`}
                    />
                    <span className="truncate">{item.mobileLabel}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <button
            ref={moreButtonRef}
            type="button"
            aria-expanded={moreOpen}
            aria-controls="mobile-more-sheet"
            onClick={() =>
              setMoreOpenPath((prev) =>
                prev === location.pathname ? null : location.pathname,
              )
            }
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
              moreOpen
                ? "text-[#6EE7A5]"
                : "text-[#BCD0C4] hover:text-[#F5FAF7]"
            }`}
          >
            <MoreHorizontalIcon className="h-5 w-5 shrink-0" />
            <span>More</span>
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1/4 top-2 h-2 w-2 rounded-full bg-[#6EE7A5]"
              />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/65"
            onClick={() => setMoreOpenPath(null)}
          />

          <div
            id="mobile-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-sheet-title"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[#315747] bg-[#0B241B] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#315747] pb-3">
              <div className="min-w-0">
                <h2
                  id="more-sheet-title"
                  className="truncate text-base font-semibold text-[#F5FAF7]"
                >
                  More options
                </h2>
                <p className="truncate text-xs text-[#BCD0C4]">
                  {user.fullName || user.role}
                </p>
              </div>

              <button
                ref={closeSheetButtonRef}
                type="button"
                aria-label="Close menu"
                onClick={() => setMoreOpenPath(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#315747] bg-[#103326] text-[#F5FAF7] hover:bg-[#143D2E]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {secondaryMobileItems.map((item) => {
                const Icon = item.icon;
                const isNotificationsItem = item.to === notificationsPath;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpenPath(null)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium ${
                        isActive
                          ? "bg-[#17603F] text-white"
                          : "text-[#F5FAF7] hover:bg-[#103326]"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>

                    {isNotificationsItem && unreadCount > 0 && (
                      <span className="rounded-full bg-[#6EE7A5] px-2 py-0.5 text-xs font-bold text-[#071B14]">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {logoutError && (
                <p role="alert" className="px-3 py-1 text-xs text-rose-300">
                  {logoutError}
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-rose-200 hover:bg-[#103326] disabled:opacity-50"
              >
                <LogOutIcon className="h-4 w-4 shrink-0" />
                <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { currentData: user, error, isLoading, refetch } = useGetMeQuery();

  if (isLoading) {
    return <CenteredSpinner fullScreen label="Checking your session…" />;
  }

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071B14] px-6">
        <div className="cf-card max-w-sm space-y-4 text-center">
          <p role="alert" className="text-sm text-[#F5FAF7]">
            Could not verify your session.
          </p>
          <button
            type="button"
            className="cf-btn-primary w-full"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return <AuthenticatedShell key={user.id} user={user} />;
}

