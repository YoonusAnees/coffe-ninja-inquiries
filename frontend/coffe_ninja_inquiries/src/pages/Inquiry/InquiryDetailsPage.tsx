import { Link, Navigate, useParams } from "react-router-dom";

import { useGetMeQuery } from "../../features/auth/authApi";
import { useGetMyInquiryQuery } from "../../features/inquiries/inquiriesApi";
import PublicReplyForm from "../messages/PublicReplyForm";
import ReplyThread from "../messages/ReplyThread";

export default function InquiryDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: currentUser } = useGetMeQuery();

  const {
    currentData: inquiry,
    error,
    isFetching,
    refetch,
  } = useGetMyInquiryQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const errorStatus = error && "status" in error ? error.status : undefined;

  if (errorStatus === 401) {
    return <Navigate to="/login" replace />;
  }

  if (isFetching) {
    return <p role="status">Loading inquiry details…</p>;
  }

  let errorMessage = "Unable to load this inquiry.";
  let canRetry = true;

  if (!id || errorStatus === 404) {
    errorMessage = "Inquiry not found.";
    canRetry = false;
  } else if (errorStatus === 400) {
    errorMessage = "Invalid inquiry link.";
    canRetry = false;
  } else if (errorStatus === 403) {
    errorMessage = "Inquiry details are available to customer accounts.";
    canRetry = false;
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
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <article className="mt-6 space-y-4 rounded border p-5">
          <header>
            <p className="text-sm text-slate-600">{inquiry.reference}</p>
            <h1 className="mt-1 text-2xl font-semibold">{inquiry.subject}</h1>
            <p className="mt-2">{inquiry.status.replace(/_/g, " ")}</p>
            <p className="text-sm text-slate-600">
              Submitted {new Date(inquiry.createdAt).toLocaleString()}
            </p>
          </header>

          <p className="whitespace-pre-wrap">{inquiry.description}</p>

          {currentUser && (
            <ReplyThread
              key={`thread-${inquiry.id}`}
              inquiryId={inquiry.id}
              currentUserId={currentUser.id}
              viewer="CUSTOMER"
              canReply={inquiry.status !== "CLOSED"}
            />
          )}

          {inquiry.status !== "CLOSED" && (
            <PublicReplyForm
              key={`form-${inquiry.id}`}
              inquiryId={inquiry.id}
              viewer="CUSTOMER"
            />
          )}
        </article>
      )}
    </main>
  );
}
