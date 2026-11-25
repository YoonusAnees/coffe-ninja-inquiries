import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { io } from "socket.io-client";

import { baseApi } from "../../app/baseApi";
import { useGetMeQuery } from "../../features/auth/authApi";
import { useGetMyNotificationsQuery } from "../../features/notifications/notificationsApi";

function CustomerNavigation({ userId }: { userId: string }) {
  const dispatch = useDispatch();
  const { currentData: notifications, isError } =
    useGetMyNotificationsQuery(userId);

  useEffect(() => {
    const socket = io({
      autoConnect: false,
      transports: ["websocket"],
    });

    const refreshCustomerData = () => {
      dispatch(
        baseApi.util.invalidateTags([
          { type: "Notification", id: userId },
          "Message",
        ]),
      );
    };

    socket.on("notifications:ready", refreshCustomerData);
    socket.on("employee-reply:created", refreshCustomerData);
    socket.connect();

    return () => {
      socket.off("notifications:ready", refreshCustomerData);
      socket.off("employee-reply:created", refreshCustomerData);
      socket.disconnect();
    };
  }, [dispatch, userId]);

  const unreadCount =
    notifications?.filter((item) => item.readAt === null).length ?? 0;

  return (
    <nav
      aria-label="Customer navigation"
      className="flex items-center gap-4 border-b px-6 py-3"
    >
      <Link to="/inquiries">My inquiries</Link>

      <Link to="/notifications">
        Notifications
        {!isError && unreadCount > 0 && ` (${unreadCount})`}
      </Link>
    </nav>
  );
}

export default function CustomerLayout() {
  const { currentData: user, isError } = useGetMeQuery();

  return (
    <>
      {!isError && user?.role === "CUSTOMER" && (
        <CustomerNavigation key={user.id} userId={user.id} />
      )}
      <Outlet />
    </>
  );
}
