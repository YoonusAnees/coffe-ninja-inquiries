import jwt from "jsonwebtoken"
import { env } from "../config/env.mjs"


export const signAuthToken = (userId) => {

    const payload = { id: userId }
    return jwt.sign(payload, env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: env.ACCESS_TOKEN_TTL_SECONDS
    })

};

export const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256']
    })
}


