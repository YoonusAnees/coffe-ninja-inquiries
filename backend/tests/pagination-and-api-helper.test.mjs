import test from "node:test";
import assert from "node:assert/strict";

import { parsePagination } from "../utils/pagination.mjs";
import { APIHelper } from "../utils/apiHelper.mjs";

test("parsePagination applies defaults and computes offset", () => {
    assert.deepEqual(parsePagination({}), {
        page: 1,
        limit: 10,
        offset: 0,
    });

    assert.deepEqual(parsePagination({ page: "3", limit: "4" }), {
        page: 3,
        limit: 4,
        offset: 8,
    });
});

test("parsePagination rejects out-of-range page and limit values", () => {
    assert.throws(() => parsePagination({ page: 0 }));
    assert.throws(() => parsePagination({ limit: 11 }));
});

test("APIHelper applies search/filter and computes hasNextPage from limit + 1 rows", async () => {
    let capturedLimit = null;
    let capturedOffset = null;

    const fakeQuery = {
        where() {
            return this;
        },
        limit(val) {
            capturedLimit = val;
            return this;
        },
        offset(val) {
            capturedOffset = val;
            return Promise.resolve([
                { id: "1" },
                { id: "2" },
                { id: "3" },
            ]);
        },
    };

    const initialConditions = ["base-condition"];
    const result = await new APIHelper(
        fakeQuery,
        { page: 2, limit: 2, search: "100%_test", status: "OPEN" },
        initialConditions,
    )
        .search("subject_col")
        .filter({ status: "status_col" })
        .pagination();

    assert.equal(initialConditions.length, 1);
    assert.equal(capturedLimit, 3);
    assert.equal(capturedOffset, 2);
    assert.equal(result.rows.length, 2);
    assert.deepEqual(result.pagination, {
        page: 2,
        limit: 2,
        hasNextPage: true,
    });
});

