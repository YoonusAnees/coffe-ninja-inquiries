import { useGetCustomerInquiryRepliesQuery } from "../../features/messages/messagesApi";

type Props = {
  inquiryId: string;
};

export default function CustomerReplies({ inquiryId }: Props) {
  const {
    currentData: replies = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCustomerInquiryRepliesQuery(inquiryId, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <section className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Replies</h2>
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh replies"}
        </button>
      </div>

      {isLoading && <p role="status">Loading replies…</p>}
      {isError && <p role="alert">Could not load replies.</p>}

      {!isFetching && !isError && replies.length === 0 && (
        <p>No replies yet.</p>
      )}

      {!isError && replies.length > 0 && (
        <ul className="space-y-3">
          {replies.map((reply) => (
            <li key={reply.id} className="rounded border p-3">
              <p className="whitespace-pre-wrap wrap-break">{reply.body}</p>
              <time
                className="text-sm text-slate-600"
                dateTime={reply.createdAt}
              >
                {new Date(reply.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
