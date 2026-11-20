import { success } from "zod";
import { registerUser, loginUser } from "../services/auth.service.mjs";
import { authCookiesOptions, buildTokenCookie } from "../utils/jwtToken.mjs";
import AppError from "../utils/AppError.mjs";

export const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body)
        return res.status(201).json({
            success: true,
            Message: "User Registerd Successfully",
            data: user
        });

    } catch (error) {
        return next(error);
    }
}


export const login = async (req, res, next) => {
    try {
        const user = await loginUser(req.body)
        const { token, cookiesOptions } = buildTokenCookie(user);
        res.cookie("token", token, cookiesOptions)
        return res.status(200).json({
            success: true,
            message: "Successfullt Logged In",
            data: user,
            token
        })

    } catch (error) {
        return next(error)
    }
}


export const logout = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new AppError("No user is looged In", 401));
    }

    res.clearCookie("token", authCookiesOptions)

    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    })
}