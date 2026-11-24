import { useState } from "react";

import InquiryAssignmentForm from "./InquiryAssignmentForm";
import {
  useGetAdminInquiriesQuery,
  useGetAssignableEmployeesQuery,
} from "../../features/inquiries/inquiriesApi";
import ResolvedInquiryActions from "./ResolvedInquiryActions";

export default function AdminInquiriesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queue = useGetAdminInquiriesQuery();
  const employeeList = useGetAssignableEmployeesQuery();

  const inquiries = queue.data ?? [];
  const inquiry = inquiries.find((item) => item.id === selectedId);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Admin Inquiries</h1>

      {queue.isLoading && <p role="status">Loading inquiries…</p>}

      {queue.isError && (
        <div>
          <p role="alert">Could not load the inquiry queue.</p>
          <button type="button" onClick={() => void queue.refetch()}>
            Retry
          </button>
        </div>
      )}

      {queue.isSuccess && inquiries.length === 0 && (
        <p>No inquiries have been submitted yet.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ul className="space-y-2">
          {inquiries.map((item) => (
            <li key={item.id}>
              <button
                className="w-full rounded border p-3 text-left aria-pressed:bg-slate-100"
                type="button"
                aria-pressed={selectedId === item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="block font-medium">{item.subject}</span>
                <span className="block text-sm text-slate-600">
                  {item.reference} · {item.status.replaceAll("_", " ")}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {inquiry && (
          <section className="space-y-4 rounded border p-4">
            <h2 className="text-xl font-semibold">{inquiry.subject}</h2>
            <p className="whitespace-pre-wrap">{inquiry.description}</p>

            {inquiry.status === "RESOLVED" && (
              <ResolvedInquiryActions
                inquiryId={inquiry.id}
                version={inquiry.version}
              />
            )}

            {employeeList.isLoading && <p role="status">Loading employees…</p>}

            {employeeList.isError && (
              <div>
                <p role="alert">Could not load assignable employees.</p>
                <button
                  type="button"
                  onClick={() => void employeeList.refetch()}
                >
                  Retry
                </button>
              </div>
            )}

            {employeeList.isSuccess && employeeList.data.length === 0 && (
              <p>No active employees are available for assignment.</p>
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
        )}
      </div>
    </main>
  );
}
