import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "../config/db/db.mjs";
import { notifications } from "../config/db/schema/schema.notifications.mjs";
import AppError from "../utils/AppError.mjs";

const uuidSchema = z.string().uuid();

const notificationFields = {
    id: notifications.id,
    type: notifications.type,
    inquiryId: notifications.inquiryId,
    readAt: notifications.readAt,
    createdAt: notifications.createdAt,
};

export const getMyNotifications = async (userId) => {
    const recipientId = uuidSchema.parse(userId);

    return db
        .select(notificationFields)
        .from(notifications)
        .where(eq(notifications.recipientId, recipientId))
        .orderBy(desc(notifications.createdAt), desc(notifications.id));
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