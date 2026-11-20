import { registerUser } from "../services/auth.service.mjs";

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