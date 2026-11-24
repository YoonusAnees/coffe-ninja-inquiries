import {
  useReopenInquiryMutation,
  useCloseInquiryMutation,
} from "../../features/inquiries/inquiriesApi";

type Props = {
  inquiryId: string;
  version: number;
};

export default function ResolvedInquiryActions({ inquiryId, version }: Props) {
  const [reopenInquiry, reopenRequest] = useReopenInquiryMutation();
  const [closeInquiry, closeRequest] = useCloseInquiryMutation();

  const isSaving = reopenRequest.isLoading || closeRequest.isLoading;
  const error = reopenRequest.error || closeRequest.error;
  const hasConflict = error && "status" in error && error.status === 409;

  const handleReopen = () => {
    closeRequest.reset();
    void reopenInquiry({ inquiryId, version });
  };

  const handleClose = () => {
    reopenRequest.reset();
    void closeInquiry({ inquiryId, version });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={isSaving}
          onClick={handleReopen}
        >
          {reopenRequest.isLoading ? "Reopening…" : "Reopen inquiry"}
        </button>

        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
          disabled={isSaving}
          onClick={handleClose}
        >
          {closeRequest.isLoading ? "Closing…" : "Close inquiry"}
        </button>
      </div>

      {hasConflict && (
        <p role="alert">This inquiry changed. Review its latest status.</p>
      )}

      {error && !hasConflict && (
        <p role="alert">Could not update the inquiry. Please try again.</p>
      )}
    </div>
  );
}
