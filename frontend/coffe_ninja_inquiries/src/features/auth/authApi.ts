import { baseApi } from "../../app/baseApi";

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

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<UserResponse, RegisterInput>({
      query: (body) => ({
        url: "register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<UserResponse, LoginInput>({
      query: (body) => ({
        url: "login",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : ["CurrentUser"]),
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => "profile",
      transformResponse: (response: UserResponse) => response.data.user,
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
          return;
        }

        dispatch(baseApi.util.resetApiState());
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;