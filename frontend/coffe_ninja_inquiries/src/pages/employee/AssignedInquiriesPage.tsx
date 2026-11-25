import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetAssignedInquiriesQuery } from "../../features/inquiries/inquiriesApi";

export default function AssignedInquiriesPage() {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    data: inquiries = [],
    isLoading,
    isError,
    refetch,
  } = useGetAssignedInquiriesQuery();

  const handleRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Assigned Inquiries</h1>
        <Link to="/employee/notifications" className="rounded border px-3 py-2">
          Notifications
        </Link>

        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={isManualRefreshing}
          onClick={() => void handleRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : isError ? "Retry" : "Refresh"}
        </button>
      </header>

      {isLoading ? (
        <p role="status">Loading assigned inquiries…</p>
      ) : isError ? (
        <p role="alert">Could not load your assigned inquiries.</p>
      ) : inquiries.length === 0 ? (
        <p>You have no assigned inquiries.</p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="rounded border p-4">
              <p className="text-sm text-slate-600">{inquiry.reference}</p>
              <h2 className="font-semibold">
                <Link
                  className="underline"
                  to={`/employee/inquiries/${encodeURIComponent(inquiry.id)}`}
                >
                  {inquiry.subject}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                {inquiry.status.replace(/_/g, " ")} · {inquiry.priority}{" "}
                priority
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
