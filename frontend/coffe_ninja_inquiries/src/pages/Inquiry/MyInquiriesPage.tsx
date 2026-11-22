import { Link, Navigate } from "react-router-dom";
import { useGetMyInquiriesQuery } from "../../features/inquiries/inquiriesApi";
export default function MyInquiriesPage() {
  const {
    data: inquiries,
    error,
    isFetching,
    refetch,
  } = useGetMyInquiriesQuery(undefined, { refetchOnMountOrArgChange: true });

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (error && "status" in error && error.status === 403) {
    return <p role="alert">My Inquiries is available to customer accounts.</p>;
  }

  if (isFetching) {
    return <p role="status">Loading your inquiries…</p>;
  }

  if (error || !inquiries) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p role="alert">Unable to load your inquiries.</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">My Inquiries</h1>
        <Link
          to="/inquiries/new"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          New Inquiry
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <p className="mt-6">You haven’t submitted any inquiries yet.</p>
      ) : (
        <ul className="mt-6 divide-y rounded border">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                to={`/inquiries/${inquiry.id}`}
                className="block p-4 hover:bg-slate-50"
              >
                <p className="font-medium">{inquiry.subject}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {inquiry.reference} · {inquiry.status.replaceAll("_", " ")} ·{" "}
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
