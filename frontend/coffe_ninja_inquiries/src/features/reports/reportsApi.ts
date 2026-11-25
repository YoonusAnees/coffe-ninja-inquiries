import { baseApi } from "../../app/baseApi";
import type { InquiryStatus } from "../inquiries/inquiriesApi";

export type EmployeeWorkload = {
  employeeId: string;
  fullName: string;
  isActive: boolean;
  openInquiryCount: number;
};

type InquiryStatusReport = {
  total: number;
  statuses: {
    status: InquiryStatus;
    count: number;
  }[];
};

type ReportResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeWorkload: builder.query<EmployeeWorkload[], void>({
      query: () => "reports/employee-workload",

      transformResponse: (
        response: ReportResponse<{ employees: EmployeeWorkload[] }>,
      ) => response.data.employees,

      providesTags: [{ type: "Inquiry", id: "EMPLOYEE_WORKLOAD" }],
    }),

    getInquiryStatusReport: builder.query<InquiryStatusReport, void>({
      query: () => "reports/inquiry-status",

      transformResponse: (response: ReportResponse<InquiryStatusReport>) =>
        response.data,

      providesTags: [{ type: "Inquiry", id: "STATUS_REPORT" }],
    }),
  }),
});

export const {
  useGetEmployeeWorkloadQuery,
  useGetInquiryStatusReportQuery,
} = reportsApi;