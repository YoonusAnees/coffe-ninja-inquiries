import {
    getMyNotifications,
    markMyNotificationRead,
} from "../services/notification.service.mjs";

export const listMyNotifications = async (req, res, next) => {
    try {
        const { notifications, pagination, unreadCount } =
            await getMyNotifications(req.user.id, req.query);

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Notifications fetched.",
            data: { notifications, pagination, unreadCount },
        });
    } catch (error) {
        return next(error);
    }
};

export const markNotificationRead = async (req, res, next) => {
    try {
        const notification = await markMyNotificationRead(
            req.params.id,
            req.user.id,
        );

        res.set("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            data: { notification },
        });
    } catch (error) {
        return next(error);
    }
};