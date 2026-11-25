import { useGetEmployeeWorkloadQuery } from "../../features/reports/reportsApi";
import { TableSkeleton } from "../ui/LoadingState";

export default function EmployeeWorkloadTable() {
  const {
    data: employees = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeWorkloadQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <section
      aria-labelledby="employee-workload-heading"
      className="cf-card space-y-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="employee-workload-heading"
          className="text-lg font-semibold text-[#F5FAF7]"
        >
          Employee workload
        </h2>

        <button
          type="button"
          className="cf-btn-secondary text-xs"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh workload"}
        </button>
      </header>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <p role="alert" className="text-sm text-rose-200">
          Could not load employee workload. Try refreshing.
        </p>
      ) : employees.length === 0 ? (
        <p className="text-sm text-[#BCD0C4]">No employee accounts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Open inquiry counts by employee
            </caption>

            <thead>
              <tr className="border-b border-[#315747] text-xs uppercase tracking-wider text-[#BCD0C4]">
                <th scope="col" className="px-2 py-2.5">
                  Employee
                </th>
                <th scope="col" className="px-2 py-2.5">
                  Account
                </th>
                <th scope="col" className="px-2 py-2.5 text-right">
                  Open inquiries
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.employeeId}
                  className="border-b border-[#315747]/60 last:border-0"
                >
                  <th
                    scope="row"
                    className="px-2 py-2.5 font-medium text-[#F5FAF7]"
                  >
                    {employee.fullName}
                  </th>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                        employee.isActive
                          ? "border-[#6EE7A5]/45 bg-[#17603F]/40 text-[#6EE7A5]"
                          : "border-[#315747] bg-[#0B241B] text-[#BCD0C4]"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-[#F5FAF7]">
                    {employee.openInquiryCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
