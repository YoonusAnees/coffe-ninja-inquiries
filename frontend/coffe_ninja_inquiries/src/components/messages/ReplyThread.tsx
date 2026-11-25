import { useState } from "react";

import { API_BASE_URL, API_CREDENTIALS } from "../../config/env";
import {
  useGetCustomerInquiryRepliesQuery,
  useGetEmployeeInquiryRepliesQuery,
  type PublicReply,
} from "../../features/messages/messagesApi";

import PublicReplyForm from "./PublicReplyForm";
import { ThreadSkeleton } from "../ui/LoadingState";
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
  const [downloadError, setDownloadError] = useState("");

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

  const handleDownloadAttachment = async (attachment: {
    id: string;
    originalName: string;
  }) => {
    setDownloadError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}message/attachments/${encodeURIComponent(attachment.id)}/download`,
        { credentials: API_CREDENTIALS },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setDownloadError(
          data?.message || "Could not download the attachment.",
        );
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError("Could not download the attachment.");
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
    <section className="space-y-4 border-t border-[#315747] pt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#F5FAF7]">Conversation</h2>

        <button
          type="button"
          className="cf-btn-secondary text-xs"
          disabled={isManualRefreshing}
          onClick={() => void handleManualRefresh()}
        >
          {isManualRefreshing ? "Refreshing…" : "Refresh replies"}
        </button>
      </div>

      {thread.isLoading && <ThreadSkeleton />}

      {thread.isError && (
        <p role="alert" className="text-sm text-rose-200">
          Could not load the conversation.
        </p>
      )}

      {downloadError && (
        <p role="alert" className="text-sm text-rose-300">
          {downloadError}
        </p>
      )}

      {thread.isSuccess && messages.length === 0 && (
        <p className="text-sm text-[#BCD0C4]">No messages yet.</p>
      )}

      {!thread.isError && (
        <ul className="space-y-4">
          {topLevelMessages.map((message) => {
            const isMine = message.authorId === currentUserId;
            const replies = repliesByMessageId.get(message.id) ?? [];
            const isSelected = selectedMessageId === message.id;
            const showReplyButton = isCustomer && canReply && !isMine;

            return (
              <li
                key={message.id}
                className="space-y-3 rounded-xl border border-[#315747] bg-[#0B241B] p-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#6EE7A5]">
                    {formatAuthorLabel(message, currentUserId)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#F5FAF7]">
                    {message.body}
                  </p>

                  {message.attachment && (
                    <button
                      type="button"
                      className="mt-2 inline-block break-all text-left text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
                      onClick={() =>
                        void handleDownloadAttachment(message.attachment!)
                      }
                    >
                      Download {message.attachment.originalName}
                    </button>
                  )}

                  <time
                    className="mt-1.5 block text-xs text-[#BCD0C4]"
                    dateTime={message.createdAt}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </time>
                </div>

                {replies.length > 0 && (
                  <ul
                    aria-label="Replies to this message"
                    className="ml-3 space-y-3 border-l-2 border-[#315747] pl-4"
                  >
                    {replies.map((reply) => (
                      <li
                        key={reply.id}
                        className="rounded-lg border border-[#315747]/70 bg-[#071B14] p-3"
                      >
                        <p className="text-xs font-semibold text-[#6EE7A5]">
                          {formatAuthorLabel(reply, currentUserId)}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#F5FAF7]">
                          {reply.body}
                        </p>

                        {reply.attachment && (
                          <button
                            type="button"
                            className="mt-2 inline-block break-all text-left text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
                            onClick={() =>
                              void handleDownloadAttachment(reply.attachment!)
                            }
                          >
                            Download {reply.attachment.originalName}
                          </button>
                        )}

                        <time
                          className="mt-1.5 block text-xs text-[#BCD0C4]"
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
                    className="text-sm font-medium text-[#6EE7A5] underline-offset-4 hover:underline"
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
                    onSent={() => setSelectedMessageId(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {thread.isSuccess && !thread.isError && (
        <MarkVisibleRepliesRead
          key={`${currentUserId}-${inquiryId}`}
          inquiryId={inquiryId}
          userId={currentUserId}
          replies={messages}
          notificationType={
            viewer === "CUSTOMER" ? "EMPLOYEE_REPLIED" : "CUSTOMER_REPLIED"
          }
        />
      )}
    </section>
  );
}
