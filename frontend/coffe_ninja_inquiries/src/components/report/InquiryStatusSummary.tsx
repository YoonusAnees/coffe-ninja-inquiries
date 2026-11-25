import type { InquiryStatus } from "../../features/inquiries/inquiriesApi";
import { useGetInquiryStatusReportQuery } from "../../features/reports/reportsApi";

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
      className="space-y-4 rounded border p-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="inquiry-status-heading" className="text-lg font-semibold">
          Inquiries by status
        </h2>

        <button
          type="button"
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh counts"}
        </button>
      </header>

      {isError ? (
        <p role="alert">Could not load inquiry counts. Try refreshing.</p>
      ) : !report ? (
        <p role="status">Loading inquiry counts…</p>
      ) : (
        <>
          <p className="text-sm text-slate-700">
            Total inquiries: <strong>{report.total}</strong>
          </p>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {report.statuses.map(({ status, count }) => (
              <div key={status} className="rounded border p-3">
                <dt className="text-sm text-slate-600">
                  {statusLabels[status]}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
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
