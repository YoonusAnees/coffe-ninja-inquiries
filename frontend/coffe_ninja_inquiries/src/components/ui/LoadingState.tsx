import { SpinnerIcon } from "./Icons";

export function CenteredSpinner({
  label = "Loading…",
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 px-4 text-center ${
        fullScreen ? "min-h-screen bg-[#071B14]" : "min-h-[40vh] w-full py-12"
      }`}
    >
      <SpinnerIcon
        className="h-8 w-8 animate-spin text-[#6EE7A5]"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-[#BCD0C4]">{label}</p>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading items" className="space-y-2.5 sm:space-y-3">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[#315747] bg-[#103326] p-3 sm:p-3.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-[#143D2E]" />
              <div className="h-4 w-3/4 rounded bg-[#143D2E]" />
            </div>
            <div className="h-5 w-20 shrink-0 rounded-full bg-[#143D2E]" />
          </div>
          <div className="mt-2.5 h-3 w-32 rounded bg-[#143D2E]" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading inquiry details"
      className="cf-card animate-pulse space-y-5"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-2 border-b border-[#315747] pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 w-28 rounded bg-[#143D2E]" />
          <div className="h-5 w-24 rounded-full bg-[#143D2E]" />
        </div>
        <div className="h-6 w-2/3 rounded bg-[#143D2E]" />
        <div className="h-3 w-40 rounded bg-[#143D2E]" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-[#143D2E]" />
        <div className="h-3.5 w-5/6 rounded bg-[#143D2E]" />
        <div className="h-3.5 w-2/3 rounded bg-[#143D2E]" />
      </div>
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div role="status" aria-label="Loading messages" className="space-y-3">
      <span className="sr-only">Loading…</span>
      {[0, 1].map((item) => (
        <div
          key={item}
          className="animate-pulse space-y-2 rounded-xl border border-[#315747] bg-[#0B241B] p-4"
        >
          <div className="h-3 w-36 rounded bg-[#143D2E]" />
          <div className="h-4 w-4/5 rounded bg-[#143D2E]" />
          <div className="h-3 w-28 rounded bg-[#143D2E]" />
        </div>
      ))}
    </div>
  );
}

export function ReportSummarySkeleton() {
  return (
    <div role="status" aria-label="Loading counts" className="animate-pulse space-y-4">
      <span className="sr-only">Loading…</span>
      <div className="h-4 w-36 rounded bg-[#143D2E]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#315747] bg-[#071B14] p-3"
          >
            <div className="h-3 w-20 rounded bg-[#143D2E]" />
            <div className="mt-2 h-6 w-10 rounded bg-[#143D2E]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div role="status" aria-label="Loading table" className="animate-pulse space-y-2.5">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 rounded-lg border border-[#315747]/60 bg-[#071B14] px-3 py-3"
        >
          <div className="h-4 w-40 rounded bg-[#143D2E]" />
          <div className="h-5 w-16 rounded-full bg-[#143D2E]" />
          <div className="h-4 w-8 rounded bg-[#143D2E]" />
        </div>
      ))}
    </div>
  );
}

