import multer from "multer";

import AppError from "../utils/AppError.mjs";

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 1,
        fileSize: MAX_ATTACHMENT_BYTES,
        fields: 2,
        fieldSize: 256 * 1024,
    },
}).single("attachment");

export const parseReplyAttachment = (req, res, next) => {
    upload(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return next(new AppError("The attachment must be 5 MiB or smaller.", 413));
            }

            if (
                error.code === "LIMIT_FILE_COUNT" ||
                error.code === "LIMIT_UNEXPECTED_FILE"
            ) {
                return next(
                    new AppError("Send one file using the field name 'attachment'.", 400),
                );
            }

            return next(new AppError("The reply form exceeds the allowed limits.", 400));
        }

        return next(error);
    });
};