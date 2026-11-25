import { useState } from "react";
import { Link } from "react-router-dom";
import PaginationControls from "../../components/ui/PaginationControls";
import { PriorityBadge, StatusBadge } from "../../components/ui/StatusBadge";
import { useGetAssignedInquiriesQuery } from "../../features/inquiries/inquiriesApi";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function EmployeeDashboardPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;
  const [pageState, setPageState] = useState({ page: 1, limit });
  const page = pageState.limit === limit ? pageState.page : 1;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAssignedInquiriesQuery(
      { page, limit },
      { refetchOnMountOrArgChange: true },
    );

  const inquiries = data?.inquiries ?? [];
  const pagination = data?.pagination;

  return (
    <main className="mx-auto flex w-full max-w-4xl grow shrink-0 flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-6">
      <section className="cf-card flex shrink-0 flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-[#F5FAF7] sm:text-2xl">
            Your workspace
          </h1>
          <p className="text-xs text-[#BCD0C4] sm:text-sm">
            Open an assigned inquiry to reply to the customer or record internal
            notes.
          </p>
        </div>

        <Link to="/employee/inquiries" className="cf-btn-primary shrink-0">
          Assigned inquiries
        </Link>
      </section>

      <section
        aria-labelledby="assigned-preview-heading"
        className="flex flex-1 flex-col gap-3 sm:gap-4"
      >
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h2
            id="assigned-preview-heading"
            className="text-base font-semibold text-[#F5FAF7] sm:text-lg"
          >
            Recent assigned inquiries
          </h2>

          <Link
            to="/employee/inquiries"
            className="text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline sm:text-sm"
          >
            View all assigned
          </Link>
        </div>

        {isLoading ? (
          <div className="cf-card shrink-0">
            <p role="status" className="text-sm text-[#BCD0C4]">
              Loading assigned inquiries…
            </p>
          </div>
        ) : isError ? (
          <div className="cf-card shrink-0 space-y-3">
            <p role="alert" className="text-sm text-rose-200">
              Could not load your assigned inquiries.
            </p>
            <button
              type="button"
              className="cf-btn-secondary"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="cf-card shrink-0 space-y-2">
            <h3 className="font-medium text-[#F5FAF7]">
              No inquiries assigned right now
            </h3>
            <p className="text-sm text-[#BCD0C4]">
              New assignments from an admin will appear here and in your
              notifications inbox.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between gap-4 sm:gap-6">
            <ul className="space-y-2.5 sm:space-y-3">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    to={`/employee/inquiries/${encodeURIComponent(inquiry.id)}`}
                    className="block rounded-xl border border-[#315747] bg-[#103326] p-3 transition-colors hover:border-[#6EE7A5]/60 hover:bg-[#143D2E] sm:p-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-medium text-[#BCD0C4]">
                          {inquiry.reference}
                        </p>
                        <p className="break-words text-sm font-semibold text-[#F5FAF7] sm:text-base">
                          {inquiry.subject}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={inquiry.priority} />
                        <StatusBadge status={inquiry.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {(inquiries.length > 0 || page > 1) && (
              <div className="sticky bottom-0 mt-auto bg-[#071B14]/95 py-2 backdrop-blur">
                <PaginationControls
                  page={page}
                  hasNextPage={Boolean(pagination?.hasNextPage)}
                  isFetching={isFetching}
                  onPageChange={(nextPage) =>
                    setPageState({ page: nextPage, limit })
                  }
                />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
