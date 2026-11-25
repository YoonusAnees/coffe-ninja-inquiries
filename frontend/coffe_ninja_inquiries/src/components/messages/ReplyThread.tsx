import { useState } from "react";

import {
  useGetCustomerInquiryRepliesQuery,
  useGetEmployeeInquiryRepliesQuery,
  type PublicReply,
} from "../../features/messages/messagesApi";

import PublicReplyForm from "./PublicReplyForm";
import MarkVisibleRepliesRead from "../../pages/messages/MarkVisibleRepliesRead";

type Props = {
  inquiryId: string;
  currentUserId: string;
  viewer: "CUSTOMER" | "EMPLOYEE";
  canReply?: boolean;
};

function formatAuthorLabel(
  message: Pick<PublicReply, "authorId" | "authorName" | "authorRole">,
  currentUserId: string,
) {
  const roleLabel =
    message.authorRole.charAt(0) + message.authorRole.slice(1).toLowerCase();
  const baseLabel = `${message.authorName} (${roleLabel})`;

  return message.authorId === currentUserId ? `${baseLabel} · You` : baseLabel;
}

export default function ReplyThread({
  inquiryId,
  currentUserId,
  viewer,
  canReply = false,
}: Props) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const isCustomer = viewer === "CUSTOMER";

  const customerThread = useGetCustomerInquiryRepliesQuery(inquiryId, {
    skip: !isCustomer,
  });

  const employeeThread = useGetEmployeeInquiryRepliesQuery(inquiryId, {
    skip: isCustomer,
    pollingInterval: 10_000,
  });

  const thread = isCustomer ? customerThread : employeeThread;
  const messages = thread.currentData ?? [];

  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await thread.refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const topLevelMessages: PublicReply[] = [];
  const repliesByMessageId = new Map<string, PublicReply[]>();
  const messageIds = new Set(messages.map((message) => message.id));

  for (const message of messages) {
    const parentId = message.replyToMessageId;

    if (!parentId || !messageIds.has(parentId)) {
      topLevelMessages.push(message);
      continue;
    }

    const existingReplies = repliesByMessageId.get(parentId);

    if (existingReplies) {
      existingReplies.push(message);
    } else {
      repliesByMessageId.set(parentId, [message]);
    }
  }

  return (
    <section className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Conversation</h2>

        <button
          type="button"
          className="rounded border px-3 py-1 disabled:opacity-50"
          disabled={isManualRefreshing}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh replies"}
        </button>
      </div>

      {thread.isLoading && <p role="status">Loading conversation…</p>}

      {thread.isError && <p role="alert">Could not load the conversation.</p>}

      {thread.isSuccess && messages.length === 0 && <p>No messages yet.</p>}

      {!thread.isError && (
        <ul className="space-y-4">
          {topLevelMessages.map((message) => {
            const isMine = message.authorId === currentUserId;
            const replies = repliesByMessageId.get(message.id) ?? [];
            const isSelected = selectedMessageId === message.id;
            const showReplyButton = isCustomer && canReply && !isMine;

            return (
              <li key={message.id} className="space-y-3 rounded border p-4">
                <div>
                  <p className="text-sm font-semibold">
                    {formatAuthorLabel(message, currentUserId)}
                  </p>
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <time
                    className="text-xs text-slate-600"
                    dateTime={message.createdAt}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </time>
                </div>

                {replies.length > 0 && (
                  <ul
                    aria-label="Replies to this message"
                    className="ml-3 space-y-3 border-l-2 border-slate-300 pl-4"
                  >
                    {replies.map((reply) => (
                      <li key={reply.id} className="rounded bg-slate-50 p-3">
                        <p className="text-sm font-semibold">
                          {formatAuthorLabel(reply, currentUserId)}
                        </p>
                        <p className="whitespace-pre-wrap">{reply.body}</p>
                        <time
                          className="text-xs text-slate-600"
                          dateTime={reply.createdAt}
                        >
                          {new Date(reply.createdAt).toLocaleString()}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}

                {showReplyButton && (
                  <button
                    type="button"
                    className="text-sm underline"
                    aria-expanded={isSelected}
                    onClick={() => {
                      setSelectedMessageId(isSelected ? null : message.id);
                    }}
                  >
                    {isSelected ? "Close reply form" : "Reply"}
                  </button>
                )}

                {showReplyButton && isSelected && (
                  <PublicReplyForm
                    inquiryId={inquiryId}
                    viewer="CUSTOMER"
                    replyToMessageId={message.id}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {viewer === "EMPLOYEE" && thread.isSuccess && !thread.isError && (
        <MarkVisibleRepliesRead
          key={`${currentUserId}-${inquiryId}`}
          inquiryId={inquiryId}
          userId={currentUserId}
          replies={messages}
        />
      )}
    </section>
  );
}
