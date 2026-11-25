import type { InquiryPriority, InquiryStatus } from "../../features/inquiries/inquiriesApi";

const statusStyles: Record<InquiryStatus, { label: string; className: string }> = {
  NEW: {
    label: "New",
    className: "border-[#6EE7A5]/45 bg-[#17603F]/50 text-[#6EE7A5]",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "border-sky-400/40 bg-sky-950/50 text-sky-200",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "border-emerald-400/40 bg-emerald-950/60 text-emerald-200",
  },
  WAITING_FOR_CUSTOMER: {
    label: "Waiting for customer",
    className: "border-amber-400/50 bg-amber-950/60 text-amber-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "border-teal-400/40 bg-teal-950/50 text-teal-200",
  },
  CLOSED: {
    label: "Closed",
    className: "border-[#315747] bg-[#0B241B] text-[#BCD0C4]",
  },
};

const priorityStyles: Record<InquiryPriority, { label: string; className: string }> = {
  LOW: {
    label: "Low priority",
    className: "border-[#315747] bg-[#0B241B] text-[#BCD0C4]",
  },
  NORMAL: {
    label: "Normal priority",
    className: "border-sky-400/40 bg-sky-950/40 text-sky-200",
  },
  URGENT: {
    label: "Urgent priority",
    className: "border-rose-400/50 bg-rose-950/60 text-rose-200",
  },
};

export function StatusBadge({ status }: { status: InquiryStatus | string }) {
  const entry = statusStyles[status as InquiryStatus] ?? {
    label: status.replaceAll("_", " "),
    className: "border-[#315747] bg-[#0B241B] text-[#BCD0C4]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: InquiryPriority }) {
  const entry = priorityStyles[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}

