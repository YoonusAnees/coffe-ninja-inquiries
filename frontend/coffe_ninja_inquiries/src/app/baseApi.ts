import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, API_CREDENTIALS } from "../config/env";
import { getAuthToken } from "../utils/authToken";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: API_CREDENTIALS,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "CurrentUser",
    "Inquiry",
    "Notification",
    "Message",
    "Category",
    "AdminCustomer",
    "AdminEmployee",
  ],
  endpoints: () => ({}),
});