import { useState } from "react";
import { ListSkeleton } from "../../components/ui/LoadingState";
import PaginationControls from "../../components/ui/PaginationControls";
import {
  useGetAllCustomersQuery,
  useGetAllEmployeesQuery,
  useUpdateEmployeeStatusMutation,
  type AdminEmployee,
} from "../../features/auth/authApi";
import { useIsMobile } from "../../hooks/useIsMobile";

type DirectoryTab = "employees" | "customers";
type StatusFilter = "" | "true" | "false";

function formatJoinedDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}

function getApiErrorMessage(error: unknown): string {
  const err = error as { data?: { message?: unknown } };
  const message = err?.data?.message;
  return typeof message === "string" && message.trim()
    ? message
    : "Unable to update employee status.";
}

function AccountStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={
        isActive
          ? "inline-flex items-center rounded-full border border-[#6EE7A5]/40 bg-[#6EE7A5]/15 px-2.5 py-0.5 text-xs font-medium text-[#6EE7A5]"
          : "inline-flex items-center rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-200"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function AdminUsersPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 2 : 4;

  const [tab, setTab] = useState<DirectoryTab>("employees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const queryParams = {
    page,
    limit,
    search,
    ...(statusFilter ? { isActive: statusFilter } : {}),
  };

  const employeesQuery = useGetAllEmployeesQuery(queryParams, {
    skip: tab !== "employees",
  });
  const customersQuery = useGetAllCustomersQuery(queryParams, {
    skip: tab !== "customers",
  });
  const [updateEmployeeStatus] = useUpdateEmployeeStatusMutation();

  const activeQuery = tab === "employees" ? employeesQuery : customersQuery;
  const pagination = activeQuery.data?.pagination ?? {
    page,
    limit,
    hasNextPage: false,
  };

  const handleTabChange = (nextTab: DirectoryTab) => {
    setTab(nextTab);
    setPage(1);
    setFeedback(null);
  };

  const handleToggleEmployee = async (emp: AdminEmployee) => {
    setFeedback(null);
    setPendingEmployeeId(emp.id);

    try {
      const updated = await updateEmployeeStatus({
        id: emp.id,
        isActive: !emp.isActive,
      }).unwrap();

      setFeedback({
        type: "success",
        text: `${updated.fullName || updated.email} has been ${
          updated.isActive ? "reactivated" : "deactivated"
        }.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error),
      });
    } finally {
      setPendingEmployeeId(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
      <div className="shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
              Customers &amp; Employees
            </h1>
            <p className="text-xs text-[#BCD0C4] sm:text-sm">
              View customer and employee details, and activate or deactivate
              staff accounts.
            </p>
          </div>

          <button
            type="button"
            className="cf-btn-secondary"
            disabled={activeQuery.isFetching}
            onClick={() => void activeQuery.refetch()}
          >
            {activeQuery.isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="cf-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Directory type"
            className="inline-flex rounded-lg border border-[#315747] bg-[#071B14] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "employees"}
              onClick={() => handleTabChange("employees")}
              className={
                tab === "employees"
                  ? "rounded-md bg-[#164231] px-3 py-1.5 text-xs font-semibold text-[#6EE7A5] sm:text-sm"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-[#BCD0C4] hover:text-[#F5FAF7] sm:text-sm"
              }
            >
              Employees
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "customers"}
              onClick={() => handleTabChange("customers")}
              className={
                tab === "customers"
                  ? "rounded-md bg-[#164231] px-3 py-1.5 text-xs font-semibold text-[#6EE7A5] sm:text-sm"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-[#BCD0C4] hover:text-[#F5FAF7] sm:text-sm"
              }
            >
              Customers
            </button>
          </div>

          <div className="grid flex-1 gap-2 sm:max-w-lg sm:grid-cols-[1fr_160px]">
            <input
              type="search"
              aria-label={`Search ${tab}`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${tab} by name…`}
              className="cf-input"
            />
            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="cf-input"
            >
              <option value="">All statuses</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
          </div>
        </div>

        {feedback && (
          <p
            role="status"
            className={
              feedback.type === "success"
                ? "rounded-lg border border-[#6EE7A5]/35 bg-[#6EE7A5]/10 px-3 py-2 text-xs text-[#6EE7A5] sm:text-sm"
                : "rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 sm:text-sm"
            }
          >
            {feedback.text}
          </p>
        )}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-0.5">
        {activeQuery.isLoading ? (
          <ListSkeleton count={limit} />
        ) : activeQuery.isError ? (
          <div className="cf-card space-y-3">
            <p role="alert" className="text-sm text-rose-200">
              Could not load {tab}.
            </p>
            <button
              type="button"
              className="cf-btn-secondary"
              onClick={() => void activeQuery.refetch()}
            >
              Try again
            </button>
          </div>
        ) : tab === "employees" ? (
          (employeesQuery.data?.employees.length ?? 0) === 0 ? (
            <div className="cf-card text-sm text-[#BCD0C4]">
              No employees match your current search or filter.
            </div>
          ) : (
            <ul className="space-y-2.5 sm:space-y-3">
              {employeesQuery.data?.employees.map((emp) => {
                const isUpdating = pendingEmployeeId === emp.id;

                return (
                  <li
                    key={emp.id}
                    className="cf-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-[#F5FAF7] sm:text-base">
                          {emp.fullName}
                        </h2>
                        <AccountStatusBadge isActive={emp.isActive} />
                      </div>
                      <p className="truncate text-xs text-[#BCD0C4] sm:text-sm">
                        {emp.email}
                      </p>
                      <p className="text-[11px] text-[#BCD0C4]/80 sm:text-xs">
                        Joined {formatJoinedDate(emp.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void handleToggleEmployee(emp)}
                        className={
                          emp.isActive
                            ? "cf-btn-secondary w-full border-rose-400/40 text-rose-200 hover:bg-rose-500/15 sm:w-auto"
                            : "cf-btn-primary w-full sm:w-auto"
                        }
                      >
                        {isUpdating
                          ? "Updating…"
                          : emp.isActive
                            ? "Deactivate"
                            : "Reactivate"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (customersQuery.data?.customers.length ?? 0) === 0 ? (
          <div className="cf-card text-sm text-[#BCD0C4]">
            No customers match your current search or filter.
          </div>
        ) : (
          <ul className="space-y-2.5 sm:space-y-3">
            {customersQuery.data?.customers.map((cust) => (
              <li
                key={cust.id}
                className="cf-card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-[#F5FAF7] sm:text-base">
                      {cust.fullName}
                    </h2>
                    <AccountStatusBadge isActive={cust.isActive} />
                  </div>
                  <p className="truncate text-xs text-[#BCD0C4] sm:text-sm">
                    {cust.email}
                  </p>
                  <p className="text-[11px] text-[#BCD0C4]/80 sm:text-xs">
                    {cust.phone || "No phone"} · Joined{" "}
                    {formatJoinedDate(cust.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0">
        <PaginationControls
          page={pagination.page}
          hasNextPage={pagination.hasNextPage}
          isFetching={activeQuery.isFetching}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}

