import { employeeSendMessage, customerGetMessages, customerSendMessage, employeeSendNote, employeeGetNotes, employeeGetMessage } from "../services/message.service.mjs"
import { downloadReplyAttachment } from "../services/attachmentDownload.service.mjs";
export const customerSend = async (req, res, next) => {
    try {
        const reply = await customerSendMessage(
            req.params.id,
            req.user.id,
            req.body,
            req.file,
        );
        res.set("Cache-Control", "no-store");

        return res.status(201).json({
            success: true,
            message: "reply sent",
            data: { reply }
        })

    } catch (error) {
        return next(error)
    }
}

export const getCustomerReplies = async (req, res, next) => {
    try {
        const replies = await customerGetMessages(
            req.params.id,
            req.user.id
        );
        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Replies fetched",
            data: { replies }
        })



    } catch (error) {
        return next(error)

    }
}

export const employeeSendReply = async (req, res, next) => {
    try {
        const reply = await employeeSendMessage(
            req.params.id,
            req.user.id,
            req.body,
            req.file,
        );

        res.set("Cache-Control", "no-store");

        return res.status(201).json({
            success: true,
            message: "Reply sent.",
            data: { reply },
        });
    } catch (error) {
        return next(error);
    }
};

export const employeeAddNote = async (req, res, next) => {
    try {
        const note = await employeeSendNote(
            req.params.id,
            req.user.id,
            req.body,
        );

        res.set("Cache-Control", "no-store");

        return res.status(201).json({
            success: true,
            message: "Internal note added.",
            data: { note },
        });
    } catch (error) {
        return next(error);
    }
};

export const getEmployeeNotes = async (req, res, next) => {
    try {
        const notes = await employeeGetNotes(
            req.params.id,
            req.user.id,
        );

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Internal notes fetched.",
            data: { notes },
        });
    } catch (error) {
        return next(error);
    }
};

export const getEmployeeOwnMessages = async (req, res, next) => {
    try {
        const replies = await employeeGetMessage(req.params.id, req.user.id);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Replies fetched.",
            data: { replies },
        });
    } catch (error) {
        return next(error);
    }
};

export const downloadAttachment = async (req, res, next) => {
    try {
        const file = await downloadReplyAttachment(
            req.params.attachmentId,
            req.user,
        );

        res.set("Cache-Control", "no-store");
        res.set("Content-Type", file.mimeType);
        res.set(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        );
        res.set("X-Content-Type-Options", "nosniff");

        return res.status(200).send(file.buffer);
    } catch (error) {
        return next(error);
    }
};