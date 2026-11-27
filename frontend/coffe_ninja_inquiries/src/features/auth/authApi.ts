import { baseApi } from "../../app/baseApi";
import { clearAuthToken, setAuthToken } from "../../utils/authToken";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = LoginInput & {
  fullName: string;
  phone?: string;
};

type MessageResponse = {
  success: true;
  message: string;
};

type UserResponse = MessageResponse & {
  data: {
    user: AuthUser;
  };
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AdminEmployee = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export type DirectoryPagination = {
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export type AdminDirectoryQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
};

function buildDirectoryParams(params: AdminDirectoryQuery) {
  return {
    ...(params.page ? { page: params.page } : {}),
    ...(params.limit ? { limit: params.limit } : {}),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.isActive ? { isActive: params.isActive } : {}),
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<UserResponse, RegisterInput>({
      query: (body) => ({
        url: "register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<AuthUser, LoginInput>({
      query: (body) => ({
        url: "login",
        method: "POST",
        body,
      }),
      transformResponse: (
        response: MessageResponse & {
          data: AuthUser | { user: AuthUser };
          token?: string;
        },
      ) => {
        if (response.token) {
          setAuthToken(response.token);
        }
        return "user" in response.data ? response.data.user : response.data;
      },
      invalidatesTags: (_result, error) => (error ? [] : ["CurrentUser"]),
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => "profile",
      transformResponse: (response: UserResponse) => response.data.user,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const status = (err as { error?: { status?: number } })?.error
            ?.status;
          if (status === 401) {
            clearAuthToken();
          }
        }
      },
      providesTags: ["CurrentUser"],
    }),

    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          clearAuthToken();
          dispatch(baseApi.util.resetApiState());
          return;
        }

        clearAuthToken();
        dispatch(baseApi.util.resetApiState());
      },
    }),

    getAllCustomers: builder.query<
      { customers: AdminCustomer[]; pagination: DirectoryPagination },
      AdminDirectoryQuery
    >({
      query: (params) => ({
        url: "get-all-customers",
        params: buildDirectoryParams(params),
      }),
      transformResponse: (
        response: MessageResponse & {
          data: { user: AdminCustomer[]; pagination: DirectoryPagination };
        },
      ) => ({
        customers: response.data.user,
        pagination: response.data.pagination,
      }),
      providesTags: ["AdminCustomer"],
    }),

    getAllEmployees: builder.query<
      { employees: AdminEmployee[]; pagination: DirectoryPagination },
      AdminDirectoryQuery
    >({
      query: (params) => ({
        url: "get-all-employees",
        params: buildDirectoryParams(params),
      }),
      transformResponse: (
        response: MessageResponse & {
          data: { employees: AdminEmployee[]; pagination: DirectoryPagination };
        },
      ) => response.data,
      providesTags: ["AdminEmployee"],
    }),

    updateEmployeeStatus: builder.mutation<
      AdminEmployee,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `employees/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (
        response: MessageResponse & { data: { employee: AdminEmployee } },
      ) => response.data.employee,
      invalidatesTags: (_result, error) =>
        error ? [] : ["AdminEmployee", "Inquiry"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useGetAllCustomersQuery,
  useGetAllEmployeesQuery,
  useUpdateEmployeeStatusMutation,
} = authApi;