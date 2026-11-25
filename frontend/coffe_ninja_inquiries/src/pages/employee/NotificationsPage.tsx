import { useState } from "react";
import { Link } from "react-router-dom";

import { useGetMeQuery } from "../../features/auth/authApi";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  type InboxNotification,
} from "../../features/notifications/notificationsApi";

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

  return (
    <li className="space-y-2 rounded border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">
          {notification.type === "CUSTOMER_REPLIED"
            ? "A customer replied to your inquiry"
            : "An inquiry was assigned to you"}
        </p>
        <span className="text-sm text-slate-600">
          {isUnread ? "Unread" : "Read"}
        </span>
      </div>

      <time
        className="block text-sm text-slate-600"
        dateTime={notification.createdAt}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </time>

      <div className="flex items-center gap-4">
        <Link
          className="underline"
          to={`/employee/inquiries/${encodeURIComponent(notification.inquiryId)}`}
        >
          Open inquiry
        </Link>

        {isUnread && (
          <button
            type="button"
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={request.isLoading || request.isSuccess}
            onClick={handleMarkRead}
          >
            {request.isLoading ? "Saving…" : "Mark as read"}
          </button>
        )}
      </div>

      {request.isError && (
        <p role="alert" className="text-sm">
          Could not mark this notification as read. Please try again.
        </p>
      )}
    </li>
  );
}

function EmployeeInbox({ userId }: { userId: string }) {
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
    <main className="mx-auto max-w-3xl space-y-5 px-6 py-8">
      <Link className="underline" to="/employee/inquiries">
        Back to assigned inquiries
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {!isLoading && !isError && (
            <p className="text-sm text-slate-600">{unreadCount} unread</p>
          )}
        </div>

        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={isManualRefreshing}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isLoading && <p role="status">Loading notifications…</p>}

      {isError && (
        <p role="alert">
          Could not load your notifications. Select Refresh to retry.
        </p>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <p>You have no notifications yet.</p>
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
    return <p role="status">Checking your session…</p>;
  }

  if (isError || !currentUser) {
    return (
      <div className="space-y-2 p-6">
        <p role="alert">Could not load your account.</p>
        <button
          type="button"
          className="underline"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  return <EmployeeInbox key={currentUser.id} userId={currentUser.id} />;
}
