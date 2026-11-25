import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PaginationControls from "../../components/ui/PaginationControls";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  inquiryStatuses,
  useGetMyInquiriesQuery,
  type InquiryStatus,
} from "../../features/inquiries/inquiriesApi";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function MyInquiriesPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [pageState, setPageState] = useState({ page: 1, limit });
  const page = pageState.limit === limit ? pageState.page : 1;

  const trimmedSearch = search.trim();
  const hasFilters = Boolean(trimmedSearch || status);

  const { data, error, isLoading, isFetching, refetch } =
    useGetMyInquiriesQuery(
      {
        page,
        limit,
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
        ...(status ? { status } : {}),
      },
      { refetchOnMountOrArgChange: true },
    );

  const inquiries = data?.inquiries ?? [];
  const pagination = data?.pagination;

  if (error && "status" in error && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  if (error && "status" in error && error.status === 403) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <p role="alert" className="cf-card text-sm text-rose-200">
          My Inquiries is available to customer accounts.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl grow shrink-0 flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-6 mt-10 md:mt-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
          My Inquiries
        </h1>
        <Link to="/inquiries/new" className="cf-btn-primary">
          New Inquiry
        </Link>
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2">
        <input
          type="search"
          aria-label="Search my inquiries"
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
      </div>

      {isLoading ? (
        <div className="cf-card shrink-0">
          <p role="status" className="text-sm text-[#BCD0C4]">
            Loading your inquiries…
          </p>
        </div>
      ) : error || !data ? (
        <div className="cf-card shrink-0 space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            Unable to load your inquiries.
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
                  setPageState({ page: 1, limit });
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#BCD0C4]">
                You haven’t submitted any inquiries yet.
              </p>
              <div>
                <Link to="/inquiries/new" className="cf-btn-primary">
                  Submit your first inquiry
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-4 sm:gap-6">
          <ul className="space-y-2.5 sm:space-y-3">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id}>
                <Link
                  to={`/inquiries/${encodeURIComponent(inquiry.id)}`}
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
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-[#BCD0C4]">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
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
