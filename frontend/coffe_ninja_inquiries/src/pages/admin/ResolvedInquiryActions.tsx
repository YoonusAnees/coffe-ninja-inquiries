import {
  useCloseInquiryMutation,
  useReopenInquiryMutation,
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
    <div className="space-y-2 border-t border-[#315747] pt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="cf-btn-secondary"
          disabled={isSaving}
          onClick={handleReopen}
        >
          {reopenRequest.isLoading ? "Reopening…" : "Reopen inquiry"}
        </button>

        <button
          type="button"
          className="cf-btn-primary"
          disabled={isSaving}
          onClick={handleClose}
        >
          {closeRequest.isLoading ? "Closing…" : "Close inquiry"}
        </button>
      </div>

      {hasConflict && (
        <p role="alert" className="text-sm text-amber-200">
          This inquiry changed. Review its latest status.
        </p>
      )}

      {error && !hasConflict && (
        <p role="alert" className="text-sm text-rose-300">
          Could not update the inquiry. Please try again.
        </p>
      )}
    </div>
  );
}
