import { useReopenInquiryMutation } from "..//../features/inquiries/inquiriesApi";

type Props = {
  inquiryId: string;
  version: number;
};

export default function ReopenInquiryButton({ inquiryId, version }: Props) {
  const [reopenInquiry, { isLoading, error }] = useReopenInquiryMutation();

  const hasConflict = error && "status" in error && error.status === 409;

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded border px-3 py-2 disabled:opacity-50"
        disabled={isLoading}
        onClick={() => void reopenInquiry({ inquiryId, version })}
      >
        {isLoading ? "Reopening…" : "Reopen inquiry"}
      </button>

      {hasConflict && (
        <p role="alert">This inquiry changed. Review its latest status.</p>
      )}

      {error && !hasConflict && (
        <p role="alert">Could not reopen this inquiry. Please try again.</p>
      )}
    </div>
  );
}
