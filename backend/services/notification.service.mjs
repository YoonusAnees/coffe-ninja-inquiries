import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "../config/db/db.mjs";
import { notifications } from "../config/db/schema/schema.notifications.mjs";
import { APIHelper } from "../utils/apiHelper.mjs";
import AppError from "../utils/AppError.mjs";
import { paginationSchema } from "../utils/pagination.mjs";

const uuidSchema = z.string().uuid();
const notificationQuerySchema = paginationSchema.strict();

const notificationFields = {
    id: notifications.id,
    type: notifications.type,
    inquiryId: notifications.inquiryId,
    messageId: notifications.messageId,
    readAt: notifications.readAt,
    createdAt: notifications.createdAt,
};

export const getMyNotifications = async (userId, queryString = {}) => {
    const recipientId = uuidSchema.parse(userId);
    const params = notificationQuerySchema.parse(queryString);

    const query = db
        .select(notificationFields)
        .from(notifications)
        .orderBy(desc(notifications.createdAt), desc(notifications.id));

    const [{ rows, pagination }, [unreadRow]] = await Promise.all([
        new APIHelper(query, params, [
            eq(notifications.recipientId, recipientId),
        ]).pagination(),
        db
            .select({ count: sql`count(*)::int` })
            .from(notifications)
            .where(
                and(
                    eq(notifications.recipientId, recipientId),
                    isNull(notifications.readAt),
                ),
            ),
    ]);

    return {
        notifications: rows,
        pagination,
        unreadCount: unreadRow?.count ?? 0,
    };
};

export const markMyNotificationRead = async (notificationId, userId) => {
    const id = uuidSchema.parse(notificationId);
    const recipientId = uuidSchema.parse(userId);

    const [notification] = await db
        .update(notifications)
        .set({
            readAt: sql`coalesce(${notifications.readAt}, now())`,
        })
        .where(
            and(
                eq(notifications.id, id),
                eq(notifications.recipientId, recipientId),
            ),
        )
        .returning(notificationFields);

    if (!notification) {
        throw new AppError("Notification not found.", 404);
    }

    return notification;
};