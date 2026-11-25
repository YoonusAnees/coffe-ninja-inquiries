import { baseApi } from "../../app/baseApi";

export type InboxNotification = {
  id: string;
  type: "INQUIRY_ASSIGNED" | "CUSTOMER_REPLIED" |"EMPLOYEE_REPLIED";
  inquiryId: string;
  messageId: string | null;
  readAt: string | null;
  createdAt: string;
};

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type NotificationsQueryArg = {
  userId: string;
  page?: number;
  limit?: number;
};

type NotificationsPage = {
  notifications: InboxNotification[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
  unreadCount: number;
};

type MarkReadInput = {
  notificationId: string;
  userId: string;
};

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<NotificationsPage, NotificationsQueryArg>({
      query: ({ page = 1, limit = 10 }) => ({
        url: "notifications",
        params: { page, limit },
      }),

      transformResponse: (response: ApiResponse<NotificationsPage>) =>
        response.data,

      providesTags: (_result, _error, { userId }) => [
        { type: "Notification", id: userId },
      ],
    }),

    markNotificationRead: builder.mutation<InboxNotification, MarkReadInput>({
      query: ({ notificationId }) => ({
        url: `notifications/${encodeURIComponent(notificationId)}/read`,
        method: "PATCH",
      }),

      transformResponse: (
        response: ApiResponse<{ notification: InboxNotification }>,
      ) => response.data.notification,

      invalidatesTags: (_result, error, { userId }) =>
        error ? [] : [{ type: "Notification", id: userId }],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
} = notificationsApi;