import { useState } from "react";
import { Link } from "react-router-dom";
import PaginationControls from "../../components/ui/PaginationControls";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useGetMyInquiriesQuery } from "../../features/inquiries/inquiriesApi";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function CustomerDashboardPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;
  const [pageState, setPageState] = useState({ page: 1, limit });
  const page = pageState.limit === limit ? pageState.page : 1;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMyInquiriesQuery(
      { page, limit },
      { refetchOnMountOrArgChange: true },
    );

  const inquiries = data?.inquiries ?? [];
  const pagination = data?.pagination;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-3 px-4 pt-4 pb-2 sm:gap-4 sm:px-6 sm:pt-6 sm:pb-4 mt-10 md:mt-0">
      <div className="shrink-0 space-y-4 sm:space-y-5">
        <section className="cf-card flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-[#F5FAF7] sm:text-2xl">
              How can we help today?
            </h1>
            <p className="text-xs text-[#BCD0C4] sm:text-sm">
              Start a new support inquiry or check updates on your recent
              requests.
            </p>
          </div>

          <Link to="/inquiries/new" className="cf-btn-primary shrink-0">
            New inquiry
          </Link>
        </section>

        <div className="flex items-center justify-between gap-3">
          <h2
            id="recent-inquiries-heading"
            className="text-base font-semibold text-[#F5FAF7] sm:text-lg"
          >
            Recent inquiries
          </h2>

          <Link
            to="/inquiries"
            className="text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline sm:text-sm"
          >
            View all inquiries
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="recent-inquiries-heading"
        className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4"
      >

        {isLoading ? (
          <div className="cf-card shrink-0">
            <p role="status" className="text-sm text-[#BCD0C4]">
              Loading recent inquiries…
            </p>
          </div>
        ) : isError ? (
          <div className="cf-card shrink-0 space-y-3">
            <p role="alert" className="text-sm text-rose-200">
              Could not load your recent inquiries.
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
            <h3 className="font-medium text-[#F5FAF7]">No inquiries yet</h3>
            <p className="text-sm text-[#BCD0C4]">
              When you have a question or issue, submit an inquiry and our team
              will respond here.
            </p>
            <div>
              <Link to="/inquiries/new" className="cf-btn-primary">
                Submit your first inquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 sm:gap-4">
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
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
                        Submitted{" "}
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {(inquiries.length > 0 || page > 1) && (
              <div className="shrink-0 pt-1">
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
