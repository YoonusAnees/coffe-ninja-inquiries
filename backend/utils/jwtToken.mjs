import { env } from "../config/env.mjs"



export const authCookiesOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
}

export const buildTokenCookie = () => {
    return {
        ...authCookiesOptions,
        maxAge: env.ACCESS_TOKEN_TTL_SECONDS * 1_000
    }
}