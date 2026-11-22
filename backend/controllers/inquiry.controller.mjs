import { createInqury } from "../services/inquiry.service.mjs";

export const submitInquiry = async (req, res, next) => {
    try {
        const inquiry = await createInqury(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Inquiry Submitted",
            data: { inquiry }
        });

    } catch (error) {
        return next(error)
    }
}