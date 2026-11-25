import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { cloudinary } from "../config/cloudinary.mjs";
import { db } from "../config/db/db.mjs";
import { attachments } from "../config/db/schema/schema.attachments.mjs";
import { inquiries } from "../config/db/schema/schema.inquiries.mjs";
import { messages } from "../config/db/schema/schema.messages.mjs";
import AppError from "../utils/AppError.mjs";

const attachmentIdSchema = z.string().uuid();

export const downloadReplyAttachment = async (attachmentId, viewer) => {
    const id = attachmentIdSchema.parse(attachmentId);

    let accessCheck;

    if (viewer.role === "CUSTOMER") {
        accessCheck = eq(inquiries.customerId, viewer.id);
    } else if (viewer.role === "EMPLOYEE") {
        accessCheck = eq(inquiries.assignedEmployeeId, viewer.id);
    } else {
        throw new AppError("This download is for customers and employees.", 403);
    }

    const [file] = await db
        .select({
            publicId: attachments.cloudinaryPublicId,
            resourceType: attachments.resourceType,
            originalName: attachments.originalName,
            mimeType: attachments.mimeType,
        })
        .from(attachments)
        .innerJoin(messages, eq(messages.id, attachments.messageId))
        .innerJoin(inquiries, eq(inquiries.id, messages.inquiryId))
        .where(
            and(
                eq(attachments.id, id),
                eq(messages.visibility, "PUBLIC"),
                accessCheck,
            ),
        )
        .limit(1);

    if (!file) {
        throw new AppError("Attachment not found.", 404);
    }

    let format = "";

    if (file.mimeType === "image/png") {
        format = "png";
    } else if (file.mimeType === "image/jpeg") {
        format = "jpg";
    }

    const signedUrl = cloudinary.utils.private_download_url(
        file.publicId,
        format,
        {
            resource_type: file.resourceType,
            type: "authenticated",
        },
    );

    try {
        const response = await fetch(signedUrl, {
            signal: AbortSignal.timeout(20_000),
        });

        if (!response.ok) {
            console.error(
                "Cloudinary attachment download failed:",
                response.status,
                response.headers.get("x-cld-error"),
            );
            await response.body?.cancel();
            throw new AppError("The attachment could not be downloaded.", 502);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        return {
            buffer,
            originalName: file.originalName,
            mimeType: file.mimeType,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError("Attachment storage is temporarily unavailable.", 502);
    }
};