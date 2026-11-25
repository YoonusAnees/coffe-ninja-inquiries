import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import { cloudinary } from "../config/cloudinary.mjs";

import AppError from "../utils/AppError.mjs";

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
]);

export const validateReplyAttachment = async (file) => {
    if (!file) {
        return null;
    }

    if (!file.buffer || file.buffer.length === 0) {
        throw new AppError("The attachment is empty.", 400);
    }

    let detectedType;

    try {
        detectedType = await fileTypeFromBuffer(file.buffer);
    } catch {
        throw new AppError("The attachment format could not be read.", 415);
    }

    if (!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
        throw new AppError("Upload a JPG, PNG, or PDF file.", 415);
    }

    return {
        buffer: file.buffer,
        originalName: path.win32.basename(file.originalname),
        mimeType: detectedType.mime,
        sizeBytes: file.buffer.length,
    };
};

export const uploadReplyAttachment = async (file) => {
    const isPdf = file.mimeType === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    const storageId = `inquiryflow/attachments/${randomUUID()}`;
    const publicId = isPdf ? `${storageId}.pdf` : storageId;

    const options = {
        public_id: publicId,
        resource_type: resourceType,
        type: "authenticated",
        overwrite: false,
    };

    const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                return reject(error);
            }

            resolve(result);
        });

        stream.on("error", reject);
        stream.end(file.buffer);
    });

    return {
        cloudinaryPublicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
    };
};

export const deleteUploadedAttachment = async (uploaded) => {
    return cloudinary.uploader.destroy(uploaded.cloudinaryPublicId, {
        resource_type: uploaded.resourceType,
        type: "authenticated",
    });
};