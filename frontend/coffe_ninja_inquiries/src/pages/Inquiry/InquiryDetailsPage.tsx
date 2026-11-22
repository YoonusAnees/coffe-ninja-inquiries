import { Link, Navigate, useParams } from "react-router-dom";

import { useGetMyInquiryQuery } from "../../features/inquiries/inquiriesApi";

export default function InquiryDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const {
    currentData: inquiry,
    error,
    isFetching,
    refetch,
  } = useGetMyInquiryQuery(id, { skip: !id, refetchOnMountOrArgChange: true });

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (isFetching) {
    return <p role="status">Loading inquiry details…</p>;
  }

  let errorMessage = "Unable to load this inquiry.";
  let canRetry = Boolean(id);

  if (!id) {
    errorMessage = "Inquiry not found.";
  }

  if (error && "status" in error) {
    if (error.status === 404) {
      errorMessage = "Inquiry not found.";
      canRetry = false;
    }

    if (error.status === 400) {
      errorMessage = "Invalid inquiry link.";
      canRetry = false;
    }

    if (error.status === 403) {
      errorMessage = "Inquiry details are available to customer accounts.";
      canRetry = false;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/inquiries" className="underline">
        Back to My Inquiries
      </Link>

      {error || !inquiry ? (
        <div className="mt-6">
          <p role="alert">{errorMessage}</p>
          {canRetry && (
            <button type="button" onClick={() => void refetch()}>
              Try again
            </button>
          )}
        </div>
      ) : (
        <article className="mt-6 rounded border p-5">
          <p className="text-sm text-slate-600">{inquiry.reference}</p>
          <h1 className="mt-1 text-2xl font-semibold">{inquiry.subject}</h1>
          <p className="mt-2">{inquiry.status.replaceAll("_", " ")}</p>
          <p className="text-sm text-slate-600">
            Submitted {new Date(inquiry.createdAt).toLocaleString()}
          </p>
          <p className="mt-4 whitespace-pre-wrap">{inquiry.description}</p>
        </article>
      )}
    </main>
  );
}
