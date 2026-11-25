import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetAssignedInquiryQuery,
  useUpdateAssignedStatusMutation,
  type EmployeeNextStatus,
  type InquiryStatus,
} from "../../features/inquiries/inquiriesApi";
import PublicReplyForm from "../../components/messages/PublicReplyForm";
import ReplyThread from "../../components/messages/ReplyThread";
import { useGetMeQuery } from "../../features/auth/authApi";
import EmployeeNotes from "./EmployeeNotes";

type StatusAction = {
  status: EmployeeNextStatus;
  label: string;
};

const statusActions: Partial<Record<InquiryStatus, StatusAction[]>> = {
  ASSIGNED: [
    {
      status: "IN_PROGRESS",
      label: "Start Working",
    },
  ],
  IN_PROGRESS: [
    {
      status: "WAITING_FOR_CUSTOMER",
      label: "Waiting for Customer",
    },
    {
      status: "RESOLVED",
      label: "Mark as Resolved",
    },
  ],
  WAITING_FOR_CUSTOMER: [
    {
      status: "IN_PROGRESS",
      label: "Resume Work",
    },
    {
      status: "RESOLVED",
      label: "Mark as Resolved",
    },
  ],
};

export default function AssignedInquiryDetailsPage() {
  const { id } = useParams();
  const { data: currentUser } = useGetMeQuery();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    currentData: inquiry,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAssignedInquiryQuery(id ?? "", {
    skip: !id,
  });

  const [updateStatus, statusUpdate] = useUpdateAssignedStatusMutation();

  const isInitialLoading = isLoading || (!inquiry && !isError && Boolean(id));
  const availableActions = inquiry ? (statusActions[inquiry.status] ?? []) : [];
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

  const handleStatusUpdate = async (nextStatus: EmployeeNextStatus) => {
    if (!inquiry || statusUpdate.isLoading || isFetching || hasConflict) {
      return;
    }

    const result = await updateStatus({
      inquiryId: inquiry.id,
      status: nextStatus,
      version: inquiry.version,
    });

    if (
      result.error &&
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

          {availableActions.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Inquiry status actions"
            >
              {availableActions.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  className="rounded border px-4 py-2 disabled:opacity-50"
                  disabled={
                    statusUpdate.isLoading || isFetching || Boolean(hasConflict)
                  }
                  onClick={() => void handleStatusUpdate(action.status)}
                >
                  {action.label}
                </button>
              ))}

              {statusUpdate.isLoading && <p role="status">Updating status…</p>}
            </div>
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
