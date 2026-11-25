import { useState } from "react";

import { ListSkeleton } from "../../components/ui/LoadingState";
import { PriorityBadge, StatusBadge } from "../../components/ui/StatusBadge";
import {
  inquiryStatuses,
  useGetAdminInquiriesQuery,
  useGetAssignableEmployeesQuery,
  type InquiryStatus,
} from "../../features/inquiries/inquiriesApi";
import InquiryAssignmentForm from "./InquiryAssignmentForm";
import ResolvedInquiryActions from "./ResolvedInquiryActions";

export default function AdminInquiriesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");

  const queue = useGetAdminInquiriesQuery();
  const employeeList = useGetAssignableEmployeesQuery();

  const allInquiries = queue.data ?? [];
  const trimmedSearch = search.trim().toLowerCase();
  const hasFilters = Boolean(trimmedSearch || statusFilter);

  const inquiries = allInquiries.filter((item) => {
    const matchesSearch =
      !trimmedSearch ||
      item.subject.toLowerCase().includes(trimmedSearch) ||
      item.reference.toLowerCase().includes(trimmedSearch) ||
      (item.customerName ?? "").toLowerCase().includes(trimmedSearch);
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inquiry = allInquiries.find((item) => item.id === selectedId);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#F5FAF7] sm:text-2xl">
            Admin Inquiries
          </h1>
          <p className="text-xs text-[#BCD0C4] sm:text-sm">
            Select an inquiry to assign an employee, set priority, or manage
            resolved requests.
          </p>
        </div>

        <button
          type="button"
          className="cf-btn-secondary"
          disabled={queue.isFetching}
          onClick={() => void queue.refetch()}
        >
          {queue.isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="search"
          aria-label="Search admin inquiries"
          placeholder="Search by subject, reference, or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cf-input"
        />

        <select
          aria-label="Filter admin inquiries by status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as InquiryStatus | "")
          }
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

      {queue.isLoading && <ListSkeleton count={4} />}

      {queue.isError && (
        <div className="cf-card space-y-3">
          <p role="alert" className="text-sm text-rose-200">
            Could not load the inquiry queue.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => void queue.refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {queue.isSuccess && allInquiries.length === 0 && (
        <div className="cf-card">
          <p className="text-sm text-[#BCD0C4]">
            No inquiries have been submitted yet.
          </p>
        </div>
      )}

      {queue.isSuccess && allInquiries.length > 0 && inquiries.length === 0 && (
        <div className="cf-card space-y-3">
          <p className="text-sm text-[#F5FAF7]">
            No inquiries match your filters.
          </p>
          <button
            type="button"
            className="cf-btn-secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {inquiries.length > 0 && (
        <div className="grid gap-5 md:grid-cols-12 md:items-start">
          {/* Queue list (hidden on mobile when an inquiry is selected) */}
          <ul
            className={`space-y-2.5 md:col-span-5 ${
              inquiry ? "hidden md:block" : "block"
            }`}
          >
            {inquiries.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    selectedId === item.id
                      ? "border-[#6EE7A5] bg-[#143D2E]"
                      : "border-[#315747] bg-[#103326] hover:border-[#6EE7A5]/50 hover:bg-[#143D2E]"
                  }`}
                  type="button"
                  aria-pressed={selectedId === item.id}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-[#F5FAF7] sm:text-base">
                      {item.subject}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="mt-1.5 block text-xs text-[#BCD0C4]">
                    {item.reference}
                    {item.customerName ? ` · ${item.customerName}` : ""}
                    {item.assignedEmployeeName
                      ? ` · Assigned to ${item.assignedEmployeeName}`
                      : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Detail & assignment panel */}
          {inquiry ? (
            <section className="cf-card h-fit space-y-4 md:sticky md:top-4 md:col-span-7">
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-xs font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
                  onClick={() => setSelectedId(null)}
                >
                  ← Back to inquiry queue
                </button>
              </div>

              <div className="space-y-2 border-b border-[#315747] pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#BCD0C4]">
                    {inquiry.reference}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={inquiry.priority} />
                    <StatusBadge status={inquiry.status} />
                  </div>
                </div>
                <h2 className="break-words text-xl font-semibold text-[#F5FAF7]">
                  {inquiry.subject}
                </h2>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#F5FAF7]">
                {inquiry.description}
              </p>

              {inquiry.status === "RESOLVED" && (
                <ResolvedInquiryActions
                  inquiryId={inquiry.id}
                  version={inquiry.version}
                />
              )}

              {employeeList.isLoading && (
                <p role="status" className="text-sm text-[#BCD0C4]">
                  Loading employees…
                </p>
              )}

              {employeeList.isError && (
                <div className="space-y-2">
                  <p role="alert" className="text-sm text-rose-200">
                    Could not load assignable employees.
                  </p>
                  <button
                    type="button"
                    className="cf-btn-secondary"
                    onClick={() => void employeeList.refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}

              {employeeList.isSuccess && employeeList.data.length === 0 && (
                <p className="text-sm text-[#BCD0C4]">
                  No active employees are available for assignment.
                </p>
              )}

              {employeeList.isSuccess && employeeList.data.length > 0 && (
                <InquiryAssignmentForm
                  key={`${inquiry.id}:${inquiry.version}`}
                  inquiry={inquiry}
                  employees={employeeList.data}
                  onRefresh={() => void queue.refetch()}
                />
              )}
            </section>
          ) : (
            <div className="cf-card hidden h-fit md:col-span-7 md:block">
              <p className="text-sm text-[#BCD0C4]">
                Select an inquiry from the list to assign or manage its status.
              </p>
            </div>
          )}
        </div>
      )}

      {hasFilters && inquiries.length > 0 && (
        <p className="text-xs text-[#BCD0C4]">
          Showing matching inquiries from the current queue.
        </p>
      )}
    </main>
  );
}
