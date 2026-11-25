import { useState } from "react";
import { Link } from "react-router-dom";
import { ListSkeleton } from "../../components/ui/LoadingState";
import PaginationControls from "../../components/ui/PaginationControls";
import { PriorityBadge, StatusBadge } from "../../components/ui/StatusBadge";
import {
  inquiryPriorities,
  inquiryStatuses,
  useGetAssignedInquiriesQuery,
  type InquiryPriority,
  type InquiryStatus,
} from "../../features/inquiries/inquiriesApi";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function AssignedInquiriesPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [priority, setPriority] = useState<InquiryPriority | "">("");
  const [pageState, setPageState] = useState({ page: 1, limit });
  const page = pageState.limit === limit ? pageState.page : 1;

  const trimmedSearch = search.trim();
  const hasFilters = Boolean(trimmedSearch || status || priority);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAssignedInquiriesQuery({
      page,
      limit,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    });

  const inquiries = data?.inquiries ?? [];
  const pagination = data?.pagination;

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
    <main className="mx-auto flex w-full max-w-4xl grow shrink-0 flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-6">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
          Assigned Inquiries
        </h1>

        <button
          type="button"
          className="cf-btn-secondary"
          disabled={isManualRefreshing}
          onClick={() => void handleRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : isError ? "Retry" : "Refresh"}
        </button>
      </header>

      <div className="grid shrink-0 gap-3 sm:grid-cols-3">
        <input
          type="search"
          aria-label="Search assigned inquiries"
          placeholder="Search by subject…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageState({ page: 1, limit });
          }}
          className="cf-input"
        />

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as InquiryStatus | "");
            setPageState({ page: 1, limit });
          }}
          className="cf-input"
        >
          <option value="">All statuses</option>
          {inquiryStatuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as InquiryPriority | "");
            setPageState({ page: 1, limit });
          }}
          className="cf-input"
        >
          <option value="">All priorities</option>
          {inquiryPriorities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton count={limit} />
      ) : isError ? (
        <div className="cf-card shrink-0 space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            Could not load your assigned inquiries.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => void handleRefresh()}
          >
            Try again
          </button>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="cf-card shrink-0 space-y-3">
          {hasFilters ? (
            <>
              <p className="text-sm text-[#F5FAF7]">
                No inquiries match your filters.
              </p>
              <button
                type="button"
                className="cf-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                  setPageState({ page: 1, limit });
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <p className="text-sm text-[#BCD0C4]">
              You have no assigned inquiries.
            </p>
          )}
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
                      <h2 className="break-words text-sm font-semibold text-[#F5FAF7] sm:text-base">
                        {inquiry.subject}
                      </h2>
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
    </main>
  );
}
