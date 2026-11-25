import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicReplyForm from "../../components/messages/PublicReplyForm";
import ReplyThread from "../../components/messages/ReplyThread";
import { PriorityBadge, StatusBadge } from "../../components/ui/StatusBadge";
import { useGetMeQuery } from "../../features/auth/authApi";
import {
  useGetAssignedInquiryQuery,
  useUpdateAssignedStatusMutation,
  type EmployeeNextStatus,
  type InquiryStatus,
} from "../../features/inquiries/inquiriesApi";
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
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
          to="/employee/inquiries"
        >
          Back to assigned inquiries
        </Link>

        <button
          type="button"
          className="cf-btn-secondary"
          disabled={isManualRefreshing || !id}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isInitialLoading && (
        <div className="cf-card">
          <p role="status" className="text-sm text-[#BCD0C4]">
            Checking inquiry access…
          </p>
        </div>
      )}

      {isError && !isInitialLoading && (
        <div className="cf-card space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            Could not open this inquiry.
          </p>
          <button
            className="cf-btn-secondary"
            type="button"
            onClick={() => void handleManualRefresh()}
          >
            Retry
          </button>
        </div>
      )}

      {inquiry && !isInitialLoading && !isError && (
        <article className="cf-card space-y-5">
          <header className="space-y-2 border-b border-[#315747] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#BCD0C4]">
                {inquiry.reference}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={inquiry.priority} />
                <StatusBadge status={inquiry.status} />
              </div>
            </div>
            <h1 className="break-words text-2xl font-semibold text-[#F5FAF7]">
              {inquiry.subject}
            </h1>
          </header>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#F5FAF7]">
            {inquiry.description}
          </p>

          {availableActions.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-2 border-t border-[#315747] pt-4"
              role="group"
              aria-label="Inquiry status actions"
            >
              {availableActions.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  className="cf-btn-secondary"
                  disabled={
                    statusUpdate.isLoading || isFetching || Boolean(hasConflict)
                  }
                  onClick={() => void handleStatusUpdate(action.status)}
                >
                  {action.label}
                </button>
              ))}

              {statusUpdate.isLoading && (
                <p role="status" className="text-sm text-[#BCD0C4]">
                  Updating status…
                </p>
              )}
            </div>
          )}

          {hasConflict && (
            <div className="space-y-2 rounded-lg border border-amber-400/50 bg-amber-950/40 p-3">
              <p role="alert" className="text-sm text-amber-200">
                Refresh the inquiry and review its current status.
              </p>
              <button
                type="button"
                className="cf-btn-secondary"
                disabled={isManualRefreshing}
                onClick={() => void refreshAfterConflict()}
              >
                {isManualRefreshing ? "Refreshing…" : "Refresh inquiry"}
              </button>
            </div>
          )}

          {statusUpdate.isError && !hasConflict && (
            <p role="alert" className="text-sm text-rose-300">
              Could not update the inquiry status.
            </p>
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
