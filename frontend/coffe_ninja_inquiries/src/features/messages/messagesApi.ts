import { baseApi } from "../../app/baseApi";

export type ReplyAttachment = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export type PublicReply = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  body: string;
  replyToMessageId: string | null;
  attachment?: ReplyAttachment | null;
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
  replyToMessageId?: string | null;
  attachment?: File;
};

function buildReplyBody(input: SendPublicReplyInput) {
  const { body, replyToMessageId, attachment } = input;

  if (!attachment) {
    if (replyToMessageId) {
      return { body, replyToMessageId };
    }

    return { body };
  }

  const form = new FormData();
  form.append("body", body);
  form.append("attachment", attachment);

  if (replyToMessageId) {
    form.append("replyToMessageId", replyToMessageId);
  }

  return form;
}

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
      query: (input) => ({
        url: `message/${encodeURIComponent(input.inquiryId)}/replies`,
        method: "POST",
        body: buildReplyBody(input),
      }),
      transformResponse: (response: ApiResponse<{ reply: PublicReply }>) =>
        response.data.reply,
      invalidatesTags: (_result, error, { inquiryId }) =>
        error ? [] : [{ type: "Message", id: inquiryId }],
    }),

    sendPublicReply: builder.mutation<PublicReply, SendPublicReplyInput>({
      query: (input) => ({
        url: `message/assigned/${encodeURIComponent(input.inquiryId)}/replies`,
        method: "POST",
        body: buildReplyBody(input),
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