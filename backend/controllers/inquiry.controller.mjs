import { createInqury, listMyInquiries, getMyInquryById, inquriesAdmin, listAssignableEmployee, assignInquiry, getAssignedInquires, getAssignedInquiry, updateAssignedInquiryStatus, reopenInquiry, closeInquiry } from "../services/inquiry.service.mjs";

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
        const { inquiries, pagination } = await listMyInquiries(req.user.id, req.query);
        res.set("Cache-Control", "no-store");
        return res.status(200).json({
            success: true,
            message: "Inquiries fetched",
            data: { inquiries, pagination },
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

export const getAssinableEmployees = async (req, res, next) => {
    try {
        const { employees, pagination } = await listAssignableEmployee(req.query);
        res.set("Cache-Control", "no-store");


        return res.status(200).json({
            success: true,
            message: employees.length === 0 ? "No employee found" : "Employees fetched",
            data: { employees, pagination }
        })

    } catch (error) {
        return next(error)
    }
}

export const updatedInquiryAssignment = async (req, res, next) => {
    try {
        const inquiry = await assignInquiry(req.params.id, req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Inqury assignment saved",
            data: { inquiry }
        });

    } catch (error) {
        return next(error)
    }
}

export const listAssignedInquires = async (req, res, next) => {

    try {
        const { inquiries, pagination } = await getAssignedInquires(req.user.id, req.query)
        return res.status(200).json({
            success: true,
            messsage: "Assigned inquires fetched",
            data: { inquiries, pagination }
        })

    } catch (error) {
        return next(error);
    }
}

export const showAssignedInquiry = async (req, res, next) => {
    try {

        const inquires = await getAssignedInquiry(req.params.id, req.user.id);
        res.set("Cache-Control", "no-store");
        return res.status(200).json({
            success: true,
            message: "Assigned Inquiry Fetched",
            data: { inquires }
        })


    } catch (error) {
        return next(error)
    }
}

export const changeAssignedInquiryStatus = async (req, res, next) => {
    try {
        const inquiry = await updateAssignedInquiryStatus(req.params.id,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Inquiry status updated.",
            data: { inquiry }
        })

    } catch (error) {
        return next(error)
    }
}


export const reopenResolvedInquiry = async (req, res, next) => {
    try {
        const inquiry = await reopenInquiry(req.params.id, req.user, req.body);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Inquiry reopened.",
            data: { inquiry },
        });
    } catch (error) {
        return next(error);
    }
};

export const closeResolvedInquiry = async (req, res, next) => {
    try {
        const inquiry = await closeInquiry(req.params.id, req.user, req.body);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Inquiry closed.",
            data: { inquiry },
        });
    } catch (error) {
        return next(error);
    }
};