import { createAssignedInquiryReplay,getCustomerInquiryReplies } from "../services/message.service.mjs"

export const CustomerSendReply = async (req, res, next) => {
    try {
        const reply = await createAssignedInquiryReplay(
            req.params.id,
            req.user.id,
            req.body
        );
        res.set("Cache-Control", "no-store");

        return res.status(201).json({
            sucess: true,
            message: "reply sent",
            data: { reply }
        })

    } catch (error) {
        return next(error)
    }
}

export const getCustomerReplies = async (req, res, next) => {
    try {
        const replies = await getCustomerInquiryReplies(
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