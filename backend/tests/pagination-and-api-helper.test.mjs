import assert from "node:assert/strict";
import test from "node:test";

import { APIHelper } from "../utils/apiHelper.mjs";
import { parsePagination } from "../utils/pagination.mjs";

test("parsePagination applies defaults and coerces valid query params", () => {
  assert.deepEqual(parsePagination({}), {
    page: 1,
    limit: 10,
    offset: 0,
  });

  assert.deepEqual(parsePagination({ page: "3", limit: "10" }), {
    page: 3,
    limit: 10,
    offset: 20,
  });
});

test("parsePagination rejects out-of-range page or limit", () => {
  assert.throws(() => parsePagination({ page: 0 }));
  assert.throws(() => parsePagination({ limit: 101 }));
});

test("APIHelper builds search, filter, and slices pagination with hasNextPage", async () => {
  const captured = {};
  const fakeQuery = {
    where(condition) {
      captured.where = condition;
      return this;
    },
    limit(val) {
      captured.limit = val;
      return this;
    },
    async offset(val) {
      captured.offset = val;
      return [{ id: 1 }, { id: 2 }, { id: 3 }];
    },
  };

  const result = await new APIHelper(fakeQuery, {
    page: 2,
    limit: 2,
    search: "100%_test",
    status: "NEW",
  })
    .search({ name: "subject" })
    .filter({ status: { name: "status" } })
    .pagination();

  assert.equal(captured.limit, 3);
  assert.equal(captured.offset, 2);
  assert.deepEqual(result.rows, [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(result.pagination, {
    page: 2,
    limit: 2,
    hasNextPage: true,
  });
});
