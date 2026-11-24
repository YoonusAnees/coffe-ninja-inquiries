import { baseApi } from "../../app/baseApi";

type PublicReply = {
  id: string;
  body: string;
  createdAt: string;
};

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type SendPublicReplyInput = {
  inquiryId: string;
  body: string;
};

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerInquiryReplies: builder.query<PublicReply[], string>({
      query: (inquiryId) =>
        `message/${encodeURIComponent(inquiryId)}/replies`,
      transformResponse: (response: ApiResponse<{ replies: PublicReply[] }>) =>
        response.data.replies,
      providesTags: (_result, _error, inquiryId) => [
        { type: "Message", id: inquiryId },
      ],
    }),

    sendPublicReply: builder.mutation<PublicReply, SendPublicReplyInput>({
      query: ({ inquiryId, body }) => ({
        url: `message/assigned/${encodeURIComponent(inquiryId)}/replies`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: ApiResponse<{ reply: PublicReply }>) =>
        response.data.reply,
      invalidatesTags: (_result, error, { inquiryId }) =>
        error ? [] : [{ type: "Message", id: inquiryId }],
    }),
  }),
});

export const {
  useGetCustomerInquiryRepliesQuery,
  useSendPublicReplyMutation,
} = messagesApi;