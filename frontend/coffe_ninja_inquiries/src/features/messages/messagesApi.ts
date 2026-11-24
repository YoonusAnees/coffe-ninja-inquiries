import { baseApi } from "../../app/baseApi";

export type PublicReply = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  body: string;
  replyToMessageId: string | null;
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
  replyToMessageId?: string;
};

type InternalNote = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};

type AddEmployeeNoteInput = {
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

    sendCustomerReply: builder.mutation<PublicReply, SendPublicReplyInput>({
  query: ({ inquiryId, body, replyToMessageId }) => ({
    url: `message/${encodeURIComponent(inquiryId)}/replies`,
    method: "POST",
    body: { body, replyToMessageId },
  }),
  transformResponse: (response: ApiResponse<{ reply: PublicReply }>) =>
    response.data.reply,
  invalidatesTags: (_result, error, { inquiryId }) =>
    error ? [] : [{ type: "Message", id: inquiryId }],
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

    getEmployeeInquiryReplies: builder.query<PublicReply[], string>({
  query: (inquiryId) =>
    `message/assigned/${encodeURIComponent(inquiryId)}/replies`,
  transformResponse: (response: ApiResponse<{ replies: PublicReply[] }>) =>
    response.data.replies,
  providesTags: (_result, _error, inquiryId) => [
    { type: "Message", id: inquiryId },
  ],
}),

getEmployeeNotes: builder.query<InternalNote[], string>({
  query: (inquiryId) =>
    `message/assigned/${encodeURIComponent(inquiryId)}/notes`,

  transformResponse: (response: ApiResponse<{ notes: InternalNote[] }>) =>
    response.data.notes,

  providesTags: (_result, _error, inquiryId) => [
    { type: "Message", id: `notes-${inquiryId}` },
  ],
}),

addEmployeeNote: builder.mutation<InternalNote, AddEmployeeNoteInput>({
  query: ({ inquiryId, body }) => ({
    url: `message/assigned/${encodeURIComponent(inquiryId)}/notes`,
    method: "POST",
    body: { body },
  }),

  transformResponse: (response: ApiResponse<{ note: InternalNote }>) =>
    response.data.note,

  invalidatesTags: (_result, error, { inquiryId }) =>
    error ? [] : [{ type: "Message", id: `notes-${inquiryId}` }],
}),

  }),
});

export const {
  useGetCustomerInquiryRepliesQuery,
  useSendCustomerReplyMutation,
  useGetEmployeeInquiryRepliesQuery,
  useSendPublicReplyMutation,
  useGetEmployeeNotesQuery,
  useAddEmployeeNoteMutation,
} = messagesApi;