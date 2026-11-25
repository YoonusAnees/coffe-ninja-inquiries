import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";
import { io } from "socket.io-client";

import { baseApi } from "../../app/baseApi";
import { useGetMeQuery } from "../../features/auth/authApi";
import { useGetMyNotificationsQuery } from "../../features/notifications/notificationsApi";

function navLinkClass({ isActive }: { isActive: boolean }) {
  const base = "rounded px-3 py-2 text-sm font-medium";

  if (isActive) {
    return `${base} bg-slate-900 text-white`;
  }

  return `${base} text-slate-700 hover:bg-slate-100`;
}

function EmployeeNavbar({ userId }: { userId: string }) {
  const dispatch = useDispatch();

  const { currentData: notifications, isError } =
    useGetMyNotificationsQuery(userId);

  useEffect(() => {
    const socket = io({
      autoConnect: false,
      transports: ["websocket"],
    });

    const refreshNotifications = () => {
      dispatch(
        baseApi.util.invalidateTags([{ type: "Notification", id: userId }]),
      );
    };

    socket.on("notifications:ready", refreshNotifications);
    socket.on("notifications:changed", refreshNotifications);
    socket.connect();

    return () => {
      socket.off("notifications:ready", refreshNotifications);
      socket.off("notifications:changed", refreshNotifications);
      socket.disconnect();
    };
  }, [dispatch, userId]);

  const unreadCount = notifications?.filter(
    (notification) => notification.readAt === null,
  ).length;

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Employee navigation"
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3"
      >
        <NavLink to="/employee/inquiries" className={navLinkClass}>
          Assigned inquiries
        </NavLink>

        <NavLink to="/employee/notifications" className={navLinkClass}>
          Notifications
          {!isError && unreadCount !== undefined && unreadCount > 0 && (
            <span className="ml-1">
              ({unreadCount})<span className="sr-only"> unread</span>
            </span>
          )}
        </NavLink>
      </nav>
    </header>
  );
}

export default function EmployeeLayout() {
  const { currentData: currentUser, isError } = useGetMeQuery();

  return (
    <>
      {!isError && currentUser?.role === "EMPLOYEE" && (
        <EmployeeNavbar key={currentUser.id} userId={currentUser.id} />
      )}

      <Outlet />
    </>
  );
}
