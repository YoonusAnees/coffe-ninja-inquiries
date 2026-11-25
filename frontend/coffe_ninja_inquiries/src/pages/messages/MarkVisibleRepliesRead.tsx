import { useEffect, useRef } from "react";

import type { PublicReply } from "../../features/messages/messagesApi";
import {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../../features/notifications/notificationsApi";

type Props = {
  inquiryId: string;
  userId: string;
  replies: PublicReply[];
  notificationType: "CUSTOMER_REPLIED" | "EMPLOYEE_REPLIED";
};

export default function MarkVisibleRepliesRead({
  inquiryId,
  userId,
  replies,
}: Props) {
  const { currentData: notifications } = useGetMyNotificationsQuery(userId);
  const [markRead] = useMarkNotificationReadMutation();
  const requestedIds = useRef(new Set<string>());

  useEffect(() => {
    const acknowledgeVisibleReplies = () => {
      if (!notifications || document.visibilityState !== "visible") return;
      if (!document.hasFocus()) return;

      const loadedReplyIds = new Set(replies.map((reply) => reply.id));

      for (const item of notifications) {
        if (item.type !== "CUSTOMER_REPLIED") continue;
        if (item.inquiryId !== inquiryId || item.readAt !== null) continue;
        if (!item.messageId || !loadedReplyIds.has(item.messageId)) continue;
        if (requestedIds.current.has(item.id)) continue;

        requestedIds.current.add(item.id);

        void markRead({ notificationId: item.id, userId })
          .unwrap()
          .catch(() => {
            // A later refresh or focus event can retry this notification.
            requestedIds.current.delete(item.id);
          });
      }
    };

    acknowledgeVisibleReplies();

    window.addEventListener("focus", acknowledgeVisibleReplies);
    document.addEventListener("visibilitychange", acknowledgeVisibleReplies);

    return () => {
      window.removeEventListener("focus", acknowledgeVisibleReplies);
      document.removeEventListener(
        "visibilitychange",
        acknowledgeVisibleReplies,
      );
    };
  }, [inquiryId, userId, replies, notifications, markRead]);

  return null;
}
