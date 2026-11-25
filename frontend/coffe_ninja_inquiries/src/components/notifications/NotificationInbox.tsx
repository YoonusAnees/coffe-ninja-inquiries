import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  type InboxNotification,
} from "../../features/notifications/notificationsApi";
import { useIsMobile } from "../../hooks/useIsMobile";
import { ListSkeleton } from "../ui/LoadingState";
import PaginationControls from "../ui/PaginationControls";

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
    <li className="rounded-xl border border-[#315747] bg-[#103326] p-3 sm:p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#F5FAF7] sm:text-base">
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
        className="mt-1 block text-xs text-[#BCD0C4]"
        dateTime={notification.createdAt}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </time>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Link
          className="text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline sm:text-sm"
          to={inquiryPath}
        >
          Open inquiry
        </Link>

        {isUnread && (
          <button
            type="button"
            className="cf-btn-secondary px-2.5 py-1 text-xs"
            disabled={request.isLoading || request.isSuccess}
            onClick={handleMarkRead}
          >
            {request.isLoading ? "Saving…" : "Mark as read"}
          </button>
        )}
      </div>

      {request.isError && (
        <p role="alert" className="mt-1.5 text-xs text-rose-300">
          Could not mark this notification as read. Please try again.
        </p>
      )}
    </li>
  );
}

export default function NotificationInbox({
  userId,
  customerView,
}: {
  userId: string;
  customerView: boolean;
}) {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;
  const [pageState, setPageState] = useState({ page: 1, limit });
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    currentData: notifications = [],
    isLoading,
    isFetching,
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

  const totalPages = Math.max(1, Math.ceil(notifications.length / limit));
  const requestedPage = pageState.limit === limit ? pageState.page : 1;
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * limit;
  const visibleNotifications = notifications.slice(
    startIndex,
    startIndex + limit,
  );
  const hasNextPage = page < totalPages;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-4">
      <div className="shrink-0 space-y-3">
        <Link
          className="inline-block text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline sm:text-sm"
          to={customerView ? "/inquiries" : "/employee/inquiries"}
        >
          {customerView ? "Back to my inquiries" : "Back to assigned inquiries"}
        </Link>

        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
              Notifications
            </h1>
            {!isLoading && !isError && (
              <p className="text-xs text-[#BCD0C4] sm:text-sm">
                {unreadCount} unread
              </p>
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
      </div>

      {isLoading && <ListSkeleton count={limit} />}

      {isError && (
        <div className="cf-card shrink-0">
          <p role="alert" className="text-sm text-rose-200">
            Could not load your notifications. Select Refresh to retry.
          </p>
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <div className="cf-card shrink-0">
          <p className="text-sm text-[#BCD0C4]">
            You have no notifications yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 sm:gap-4">
          <ul className="space-y-2.5 sm:space-y-3">
            {visibleNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                userId={userId}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="shrink-0 pt-1">
              <PaginationControls
                page={page}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
                onPageChange={(nextPage) =>
                  setPageState({ page: nextPage, limit })
                }
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}

