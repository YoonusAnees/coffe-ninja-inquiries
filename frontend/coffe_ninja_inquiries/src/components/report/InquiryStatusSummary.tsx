import type { InquiryStatus } from "../../features/inquiries/inquiriesApi";
import { useGetInquiryStatusReportQuery } from "../../features/reports/reportsApi";
import { ReportSummarySkeleton } from "../ui/LoadingState";

const statusLabels: Record<InquiryStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CUSTOMER: "Waiting for customer",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function InquiryStatusSummary() {
  const {
    data: report,
    isFetching,
    isError,
    refetch,
  } = useGetInquiryStatusReportQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <section
      aria-labelledby="inquiry-status-heading"
      className="cf-card space-y-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="inquiry-status-heading"
          className="text-lg font-semibold text-[#F5FAF7]"
        >
          Inquiries by status
        </h2>

        <button
          type="button"
          className="cf-btn-secondary text-xs"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh counts"}
        </button>
      </header>

      {isError ? (
        <p role="alert" className="text-sm text-rose-200">
          Could not load inquiry counts. Try refreshing.
        </p>
      ) : !report ? (
        <ReportSummarySkeleton />
      ) : (
        <>
          <p className="text-sm text-[#BCD0C4]">
            Total inquiries:{" "}
            <strong className="text-[#F5FAF7]">{report.total}</strong>
          </p>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {report.statuses.map(({ status, count }) => (
              <div
                key={status}
                className="rounded-lg border border-[#315747] bg-[#071B14] p-3"
              >
                <dt className="text-xs font-medium text-[#BCD0C4]">
                  {statusLabels[status]}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-[#F5FAF7]">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
