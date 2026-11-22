import { baseApi } from "../../app/baseApi";

type InquiryStatus =
  | "NEW" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";


type InquirySummary = {
    id:string;
    reference:string;
    subject:string;
    status:InquiryStatus;
    createdAt:string;
};

type InquiryDetails = InquirySummary & {
    description:string;
};

type CreatedInquiry = InquiryDetails & {
    priority:"LOW"|"NORMAL"|"HIGH"
}

type CreateInquiryInput = {
    subject:string;
    description:string;
}

type ApiResponse<T> = {
    success:true;
    message:string;
    data:T
}


const inquiryListTag = {type:"Inquiry",id:"LIST"} as const;

export const inquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInquiries: builder.query<InquirySummary[], void>({
      query: () => "inquiry/my",
      transformResponse: (response: ApiResponse<{ inquiries: InquirySummary[] }>) =>
        response.data.inquiries,
      providesTags: [inquiryListTag],
    }),

    getMyInquiry: builder.query<InquiryDetails, string>({
      query: (id) => `inquiry/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<{ inquiry: InquiryDetails }>) =>
        response.data.inquiry,
      providesTags: (_result, _error, id) => [{ type: "Inquiry", id }],
    }),

    createInquiry: builder.mutation<CreatedInquiry, CreateInquiryInput>({
      query: (body) => ({
        url: "inquiry",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ inquiry: CreatedInquiry }>) =>
        response.data.inquiry,
      invalidatesTags: (_result, error) => (error ? [] : [inquiryListTag]),
    }),
  }),
});

export const {
  useGetMyInquiriesQuery,
  useGetMyInquiryQuery,
  useCreateInquiryMutation,
} = inquiriesApi;