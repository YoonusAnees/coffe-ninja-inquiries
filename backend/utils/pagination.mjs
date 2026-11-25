import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(10).default(10),
});

export const parsePagination = (query) => {
    const { page, limit } = paginationSchema.parse(query);

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
};