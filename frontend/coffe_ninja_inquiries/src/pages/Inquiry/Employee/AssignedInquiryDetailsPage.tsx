import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetAssignedInquiryQuery,
  useUpdateAssignedStatusMutation,
  type EmployeeNextStatus,
  type InquiryStatus,
} from "../../../features/inquiries/inquiriesApi";
import PublicReplyForm from "../../messages/PublicReplyForm";
import ReplyThread from "../../messages/ReplyThread";
import { useGetMeQuery } from "../../../features/auth/authApi";
import EmployeeNotes from "../../messages/EmployeeNotes";

type StatusAction = {
  status: EmployeeNextStatus;
  label: string;
};

const statusActions: Partial<Record<InquiryStatus, StatusAction>> = {
  ASSIGNED: {
    status: "IN_PROGRESS",
    label: "Start Working",
  },
  WAITING_FOR_CUSTOMER: {
    status: "IN_PROGRESS",
    label: "Resume Work",
  },
  IN_PROGRESS: {
    status: "RESOLVED",
    label: "Mark as Resolved",
  },
};

export default function AssignedInquiryDetailsPage() {
  const { id } = useParams();
  const { data: currentUser } = useGetMeQuery();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    currentData: inquiry,
    isLoading,
    isError,
    refetch,
  } = useGetAssignedInquiryQuery(id ?? "", {
    skip: !id,
  });

  const [updateStatus, statusUpdate] = useUpdateAssignedStatusMutation();

  const isInitialLoading = isLoading || (!inquiry && !isError && Boolean(id));
  const action = inquiry ? statusActions[inquiry.status] : null;
  const hasConflict =
    statusUpdate.error &&
    "status" in statusUpdate.error &&
    statusUpdate.error.status === 409;

  const handleManualRefresh = async () => {
    if (isManualRefreshing || !id) return;
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (
      !inquiry ||
      !action ||
      statusUpdate.isLoading ||
      isInitialLoading ||
      hasConflict
    ) {
      return;
    }

    const result = await updateStatus({
      inquiryId: inquiry.id,
      status: action.status,
      version: inquiry.version,
    });

    if (
      "error" in result &&
      "status" in result.error &&
      result.error.status === 404
    ) {
      void refetch();
    }
  };

  const refreshAfterConflict = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      const result = await refetch();
      if (!result.isError) {
        statusUpdate.reset();
      }
    } finally {
      setIsManualRefreshing(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link className="underline" to="/employee/inquiries">
          Back to assigned inquiries
        </Link>

        <button
          type="button"
          className="rounded border px-3 py-1.5 disabled:opacity-50"
          disabled={isManualRefreshing || !id}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isInitialLoading && <p role="status">Checking inquiry access…</p>}

      {isError && !isInitialLoading && (
        <div>
          <p role="alert">Could not open this inquiry.</p>
          <button
            className="underline"
            type="button"
            onClick={() => void handleManualRefresh()}
          >
            Retry
          </button>
        </div>
      )}

      {inquiry && !isInitialLoading && !isError && (
        <article className="space-y-3 rounded border p-4">
          <p className="text-sm text-slate-600">{inquiry.reference}</p>
          <h1 className="text-2xl font-semibold">{inquiry.subject}</h1>
          <p className="text-sm">
            {inquiry.status.replace(/_/g, " ")} · {inquiry.priority} priority
          </p>
          <p className="whitespace-pre-wrap">{inquiry.description}</p>

          {action && (
            <button
              type="button"
              className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              disabled={statusUpdate.isLoading || Boolean(hasConflict)}
              onClick={() => void handleStatusUpdate()}
            >
              {statusUpdate.isLoading ? "Saving…" : action.label}
            </button>
          )}

          {hasConflict && (
            <div>
              <p role="alert">
                Refresh the inquiry and review its current status.
              </p>
              <button
                type="button"
                className="underline"
                disabled={isManualRefreshing}
                onClick={() => void refreshAfterConflict()}
              >
                {isManualRefreshing ? "Refreshing…" : "Refresh inquiry"}
              </button>
            </div>
          )}

          {statusUpdate.isError && !hasConflict && (
            <p role="alert">Could not update the inquiry status.</p>
          )}

          {currentUser && (
            <ReplyThread
              key={`thread-${inquiry.id}`}
              inquiryId={inquiry.id}
              currentUserId={currentUser.id}
              viewer="EMPLOYEE"
            />
          )}

          {inquiry.status !== "CLOSED" && (
            <PublicReplyForm
              key={inquiry.id}
              inquiryId={inquiry.id}
              viewer="EMPLOYEE"
            />
          )}

          {currentUser && (
            <EmployeeNotes
              key={`notes-${inquiry.id}`}
              inquiryId={inquiry.id}
              currentUserId={currentUser.id}
              canAddNote={inquiry.status !== "CLOSED"}
            />
          )}
        </article>
      )}
    </main>
  );
}
