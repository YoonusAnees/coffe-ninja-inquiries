import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export type AuthUser = {
    id:string;
    email:string;
    role:"CUSTOMER" | "EMPLOYEE" | "ADMIN"
};

type LoginInput = {
    email:string;
    password:string
};

type RegisterInput = {
    fullName:string;
    phone?:string;
}

type MessageResponse = {
    success:true;
    message:string;
}

type UserResponse = MessageResponse & {
    data:{
        user:AuthUser
    };
};

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:"/api/v1/auth/",
        credentials:"same-origin",
    }),
    tagTypes:["CurrentUser"],
    endpoints:(builder)=>({
        register:builder.mutation<UserResponse,RegisterInput>({
            query:(body)=>({
                url:"register",
                method:"POST",
                body
            }),
        }),

        login:builder.mutation<UserResponse,LoginInput>({
            query:(body)=>({
                url:"login",
                method:"POST",
                body
            }),
            invalidatesTags:(_result,error)=>(error ? [] : ["CurrentUser"])
        }),

        getMe:builder.query<AuthUser,void>({
            query:()=>"me",
            transformResponse:(response:UserResponse)=>response.data.user,
            providesTags:["CurrentUser"]
        }),
        logout:builder.mutation<MessageResponse,void>({
            query:()=>({
                url:"logout",
                method:"POST"
            }),
            invalidatesTags:(_result,error)=> (error ? [] : ["CurrentUser"])
        })
    })
})