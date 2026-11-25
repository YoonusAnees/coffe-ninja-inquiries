import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, API_CREDENTIALS } from "../config/env";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: API_CREDENTIALS,
  }),
  tagTypes: ["CurrentUser", "Inquiry", "Notification", "Message", "Category"],
  endpoints: () => ({}),
});