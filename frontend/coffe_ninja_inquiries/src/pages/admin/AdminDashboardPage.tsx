import { Link } from "react-router-dom";
import EmployeeWorkloadTable from "../../components/report/EmployeeWorkloadTable";
import InquiryStatusSummary from "../../components/report/InquiryStatusSummary";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useGetAdminInquiriesQuery } from "../../features/inquiries/inquiriesApi";

export default function AdminDashboardPage() {
  const queue = useGetAdminInquiriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const awaitingAssignment = (queue.data ?? [])
    .filter((item) => item.status === "NEW")
    .slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <section className="cf-card flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
            Service overview
          </h1>
          <p className="text-sm text-[#BCD0C4]">
            Monitor inquiry volume, team workload, and new inquiries awaiting
            assignment.
          </p>
        </div>

        <Link to="/admin/inquiries" className="cf-btn-primary shrink-0">
          Manage inquiry queue
        </Link>
      </section>

      <InquiryStatusSummary />

      <section aria-labelledby="unassigned-heading" className="cf-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="unassigned-heading"
            className="text-lg font-semibold text-[#F5FAF7]"
          >
            New inquiries awaiting assignment
          </h2>

          <Link
            to="/admin/inquiries"
            className="text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
          >
            Open queue to assign
          </Link>
        </div>

        {queue.isLoading ? (
          <p role="status" className="text-sm text-[#BCD0C4]">
            Loading inquiry queue…
          </p>
        ) : queue.isError ? (
          <div className="space-y-2">
            <p role="alert" className="text-sm text-rose-200">
              Could not load new inquiries.
            </p>
            <button
              type="button"
              className="cf-btn-secondary"
              onClick={() => void queue.refetch()}
            >
              Retry
            </button>
          </div>
        ) : awaitingAssignment.length === 0 ? (
          <p className="text-sm text-[#BCD0C4]">
            All submitted inquiries have been assigned.
          </p>
        ) : (
          <ul className="space-y-2">
            {awaitingAssignment.map((inquiry) => (
              <li
                key={inquiry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#315747] bg-[#071B14] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#BCD0C4]">
                    {inquiry.reference}
                    {inquiry.customerName ? ` · ${inquiry.customerName}` : ""}
                  </p>
                  <p className="break-words font-medium text-[#F5FAF7]">
                    {inquiry.subject}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={inquiry.status} />
                  <Link
                    to="/admin/inquiries"
                    className="cf-btn-secondary text-xs"
                  >
                    Assign
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <EmployeeWorkloadTable />
    </main>
  );
}
