import { Link } from "react-router-dom";
import EmployeeWorkloadTable from "../../components/report/EmployeeWorkloadTable";
import InquiryStatusSummary from "../../components/report/InquiryStatusSummary";
import { ListSkeleton } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useGetAdminInquiriesQuery } from "../../features/inquiries/inquiriesApi";

export default function AdminDashboardPage() {
  const queue = useGetAdminInquiriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const awaitingAssignment = (queue.data ?? [])
    .filter((item) => item.status === "NEW")
    .slice(0, 4);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-5 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
      <section className="cf-card flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6EE7A5]">
            Admin workspace
          </p>
          <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
            Service overview
          </h1>
          <p className="text-xs text-[#BCD0C4] sm:text-sm">
            Monitor inquiry volume, team workload, and new inquiries awaiting
            assignment.
          </p>
        </div>

        <Link to="/admin/inquiries" className="cf-btn-primary shrink-0">
          Manage inquiry queue
        </Link>
      </section>

      <div className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto">
        <InquiryStatusSummary />

        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <section
          aria-labelledby="unassigned-heading"
          className="cf-card space-y-4 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="unassigned-heading"
              className="text-lg font-semibold text-[#F5FAF7]"
            >
              Awaiting assignment
            </h2>

            <Link
              to="/admin/inquiries"
              className="text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline sm:text-sm"
            >
              Open queue
            </Link>
          </div>

          {queue.isLoading ? (
            <ListSkeleton count={3} />
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
            <ul className="space-y-2.5">
              {awaitingAssignment.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#315747] bg-[#071B14] p-3.5"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs text-[#BCD0C4]">
                      {inquiry.reference}
                      {inquiry.customerName ? ` · ${inquiry.customerName}` : ""}
                    </p>
                    <p className="break-words text-sm font-medium text-[#F5FAF7]">
                      {inquiry.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={inquiry.status} />
                    <Link
                      to="/admin/inquiries"
                      className="cf-btn-secondary px-2.5 py-1.5 text-xs"
                    >
                      Assign
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="lg:col-span-5">
          <EmployeeWorkloadTable />
        </div>
      </div>
      </div>
    </main>
  );
}
