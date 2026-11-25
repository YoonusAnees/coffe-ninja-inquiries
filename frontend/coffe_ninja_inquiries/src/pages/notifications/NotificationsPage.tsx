import NotificationInbox from "../../components/notifications/NotificationInbox";
import { CenteredSpinner } from "../../components/ui/LoadingState";
import { useGetMeQuery } from "../../features/auth/authApi";

export default function NotificationsPage() {
  const { data: currentUser, isLoading, isError, refetch } = useGetMeQuery();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <CenteredSpinner label="Checking your session…" />
      </main>
    );
  }

  if (isError || !currentUser) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
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
    <NotificationInbox
      key={currentUser.id}
      userId={currentUser.id}
      customerView={currentUser.role === "CUSTOMER"}
    />
  );
}

