import { createInqury, listMyInquiries, getMyInquryById, inquriesAdmin } from "../services/inquiry.service.mjs";

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


export const getMyInquiries = async (req, res, next) => {
    try {
        const inquiries = await listMyInquiries(req.user.id);
        res.set("Cache-Control", "no-store");
        return res.status(200).json({
            success: true,
            message: "Inquiries fetched",
            data: { inquiries },
        });

    } catch (error) {
        return next(error)
    }
}

export const getById = async (req, res, next) => {
    try {

        const inquiry = await getMyInquryById(req.user.id, req.params.id);
        res.set("Cache-Control", "no-store");
        return res.status(200).json({
            success: true,
            message: "Inquiry details fetched",
            data: { inquiry }
        })


    } catch (error) {
        return next(error);
    }
}

export const getAdminInquiries = async (req, res, next) => {
    try {
        const inquiries = await inquriesAdmin();
        res.set("Cache-Control", "no-store");
        return res.status(200).json({
            success: true,
            message: "Admin Inquires fetched",
            data: { inquiries }
        })

    } catch (error) {
        return next(error)
    }
}