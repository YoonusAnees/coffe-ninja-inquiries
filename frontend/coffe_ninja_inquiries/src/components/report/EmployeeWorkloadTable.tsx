import { useGetEmployeeWorkloadQuery } from "../../features/reports/reportsApi";

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
      className="space-y-4 rounded border p-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="employee-workload-heading" className="text-lg font-semibold">
          Employee workload
        </h2>

        <button
          type="button"
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh workload"}
        </button>
      </header>

      {isLoading ? (
        <p role="status">Loading employee workload…</p>
      ) : isError ? (
        <p role="alert">Could not load employee workload. Try refreshing.</p>
      ) : employees.length === 0 ? (
        <p>No employee accounts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Open inquiry counts by employee
            </caption>

            <thead>
              <tr className="border-b">
                <th scope="col" className="px-2 py-2">
                  Employee
                </th>
                <th scope="col" className="px-2 py-2">
                  Account
                </th>
                <th scope="col" className="px-2 py-2 text-right">
                  Open inquiries
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.employeeId}
                  className="border-b last:border-0"
                >
                  <th scope="row" className="px-2 py-2 font-medium">
                    {employee.fullName}
                  </th>
                  <td className="px-2 py-2">
                    {employee.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
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
