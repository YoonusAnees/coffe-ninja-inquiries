import { baseApi } from "../../app/baseApi";

export const inquiryPriorities = ["LOW", "NORMAL", "URGENT"] as const;

export type InquiryPriority = (typeof inquiryPriorities)[number];

type AdminInquiry = InquiryDetails & InquiryAssignment;


type InquiryStatus =
  | "NEW" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";


export type InquiryAssignment = {
  id: string;
  assignedEmployeeId: string | null;
  priority: InquiryPriority;
  status: string;
  version: number;
};

type AssignInquiryInput = {
  inquiryId: string;
  employeeId: string;
  priority: InquiryPriority;
  version: number;
};

type AssignInquiryResponse = {
  success: true;
  message: string;
  data: { inquiry: InquiryAssignment };
};


type AssignableEmployee = {
  id: string;
  fullName: string;
};

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
    priority:InquiryPriority
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
    assignInquiry: builder.mutation<AssignInquiryResponse, AssignInquiryInput>({
  query: ({ inquiryId, employeeId, priority, version }) => ({
    url: `inquiry/${inquiryId}/assignment`,
    method: "PATCH",
    body: { employeeId, priority, version },
  }),
  invalidatesTags: (_result, error) => (error ? [] : ["Inquiry"]),
}),

getAdminInquiries: builder.query<AdminInquiry[], void>({
  query: () => "inquiry/admin",
  transformResponse: (response: ApiResponse<{ inquiries: AdminInquiry[] }>) =>
    response.data.inquiries,
  providesTags: [inquiryListTag],
}),

getAssignableEmployees: builder.query<AssignableEmployee[], void>({
  query: () => "inquiry/get-employee",
  transformResponse: (
    response: ApiResponse<{ employees: AssignableEmployee[] }>,
  ) => response.data.employees,
}),
  }),
});

export const {
  useGetMyInquiriesQuery,
  useGetMyInquiryQuery,
  useCreateInquiryMutation,
  useAssignInquiryMutation,
  useGetAdminInquiriesQuery,
  useGetAssignableEmployeesQuery
  
} = inquiriesApi;