import { Navigate, useParams } from "react-router-dom";

import PublicReplyForm from "../../components/messages/PublicReplyForm";
import ReplyThread from "../../components/messages/ReplyThread";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useGetMeQuery } from "../../features/auth/authApi";
import { useGetMyInquiryQuery } from "../../features/inquiries/inquiriesApi";

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

  if (isFetching && !inquiry) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <p role="status" className="text-sm text-[#BCD0C4]">
          Loading inquiry details…
        </p>
      </main>
    );
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
    <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
      {error || !inquiry ? (
        <div className="cf-card shrink-0 space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            {errorMessage}
          </p>

          {canRetry && (
            <button
              type="button"
              className="cf-btn-secondary"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <article className="cf-card flex min-h-0 flex-1 flex-col gap-4 mt-10 md:mt-0">
          <div className="shrink-0 space-y-3">
            <header className="space-y-2 border-b border-[#315747] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#BCD0C4]">
                  {inquiry.reference}
                </p>
                <StatusBadge status={inquiry.status} />
              </div>
              <h1 className="break-words text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
                {inquiry.subject}
              </h1>
              <p className="text-xs text-[#BCD0C4]">
                Submitted {new Date(inquiry.createdAt).toLocaleString()}
              </p>
            </header>

            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#F5FAF7]">
              {inquiry.description}
            </p>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto">
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
          </div>
        </article>
      )}
    </main>
  );
}
