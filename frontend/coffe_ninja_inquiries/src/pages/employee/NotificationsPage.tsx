import { useState } from "react";
import { Link } from "react-router-dom";

import { useGetMeQuery } from "../../features/auth/authApi";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  type InboxNotification,
} from "../../features/notifications/notificationsApi";

const notificationLabels: Record<InboxNotification["type"], string> = {
  INQUIRY_ASSIGNED: "An inquiry was assigned to you",
  CUSTOMER_REPLIED: "Customer replied to an inquiry",
  EMPLOYEE_REPLIED: "Support replied to your inquiry",
};

type NotificationRowProps = {
  notification: InboxNotification;
  userId: string;
};

function NotificationRow({ notification, userId }: NotificationRowProps) {
  const [markRead, request] = useMarkNotificationReadMutation();
  const isUnread = notification.readAt === null;

  const handleMarkRead = () => {
    void markRead({
      notificationId: notification.id,
      userId,
    });
  };

  const inquiryPath =
    notification.type === "EMPLOYEE_REPLIED"
      ? `/inquiries/${encodeURIComponent(notification.inquiryId)}`
      : `/employee/inquiries/${encodeURIComponent(notification.inquiryId)}`;

  return (
    <li className="cf-card space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-[#F5FAF7]">
          {notificationLabels[notification.type]}
        </p>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            isUnread
              ? "border-[#6EE7A5]/50 bg-[#17603F]/50 text-[#6EE7A5]"
              : "border-[#315747] bg-[#0B241B] text-[#BCD0C4]"
          }`}
        >
          {isUnread ? "Unread" : "Read"}
        </span>
      </div>

      <time
        className="block text-xs text-[#BCD0C4]"
        dateTime={notification.createdAt}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </time>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Link
          className="text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
          to={inquiryPath}
        >
          Open inquiry
        </Link>

        {isUnread && (
          <button
            type="button"
            className="cf-btn-secondary text-xs"
            disabled={request.isLoading || request.isSuccess}
            onClick={handleMarkRead}
          >
            {request.isLoading ? "Saving…" : "Mark as read"}
          </button>
        )}
      </div>

      {request.isError && (
        <p role="alert" className="text-sm text-rose-300">
          Could not mark this notification as read. Please try again.
        </p>
      )}
    </li>
  );
}

function Inbox({
  userId,
  customerView,
}: {
  userId: string;
  customerView: boolean;
}) {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    currentData: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyNotificationsQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => item.readAt === null,
  ).length;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <Link
        className="inline-block text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
        to={customerView ? "/inquiries" : "/employee/inquiries"}
      >
        {customerView ? "Back to my inquiries" : "Back to assigned inquiries"}
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#F5FAF7]">
            Notifications
          </h1>
          {!isLoading && !isError && (
            <p className="text-sm text-[#BCD0C4]">{unreadCount} unread</p>
          )}
        </div>

        <button
          type="button"
          className="cf-btn-secondary"
          disabled={isManualRefreshing}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isLoading && (
        <div className="cf-card">
          <p role="status" className="text-sm text-[#BCD0C4]">
            Loading notifications…
          </p>
        </div>
      )}

      {isError && (
        <div className="cf-card">
          <p role="alert" className="text-sm text-rose-200">
            Could not load your notifications. Select Refresh to retry.
          </p>
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <div className="cf-card">
          <p className="text-sm text-[#BCD0C4]">
            You have no notifications yet.
          </p>
        </div>
      )}

      {!isError && notifications.length > 0 && (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              userId={userId}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

export default function NotificationsPage() {
  const { data: currentUser, isLoading, isError, refetch } = useGetMeQuery();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <p role="status" className="text-sm text-[#BCD0C4]">
          Checking your session…
        </p>
      </main>
    );
  }

  if (isError || !currentUser) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <div className="cf-card space-y-2">
          <p role="alert" className="text-sm text-rose-200">
            Could not load your account.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <Inbox
      key={currentUser.id}
      userId={currentUser.id}
      customerView={currentUser.role === "CUSTOMER"}
    />
  );
}
