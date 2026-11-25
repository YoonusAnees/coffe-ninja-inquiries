import { and, eq, ilike } from "drizzle-orm";

export class APIHelper {
    constructor(query, params, conditions = []) {
        this.query = query;
        this.params = params;
        this.conditions = [...conditions];
    }

    search(column) {
        const text = this.params.search;

        if (text) {
            const escapedText = text.replace(/[\\%_]/g, "\\$&");
            this.conditions.push(ilike(column, `%${escapedText}%`));
        }

        return this;
    }

    filter(columns) {
        for (const [key, column] of Object.entries(columns)) {
            const value = this.params[key];

            if (value !== undefined) {
                this.conditions.push(eq(column, value));
            }
        }

        return this;
    }

    async pagination() {
        const { page, limit } = this.params;
        const offset = (page - 1) * limit;

        const rows = await this.query
            .where(and(...this.conditions))
            .limit(limit + 1)
            .offset(offset);

        return {
            rows: rows.slice(0, limit),
            pagination: {
                page,
                limit,
                hasNextPage: rows.length > limit,
            },
        };
    }
}