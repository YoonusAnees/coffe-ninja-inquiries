import { env } from "../config/env.mjs"
import { signAuthToken } from "./token.mjs"



export const authCookiesOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
}

export const buildTokenCookie = (user) => {
    const token = signAuthToken(user.id);
    const cookiesOptions = {
        ...authCookiesOptions,
        maxAge: env.ACCESS_TOKEN_TTL_SECONDS * 1_000,
    }

    return { token, cookiesOptions }
}