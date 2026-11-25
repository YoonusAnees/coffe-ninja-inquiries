import test from "node:test";
import assert from "node:assert/strict";

import { rolebasedAccess } from "../middlewares/authorize.mjs";
import errorMiddleware from "../middlewares/error.mjs";
import AppError from "../utils/AppError.mjs";

const createMockRes = () => {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
};

test("rolebasedAccess rejects unauthenticated requests with 401 AppError", () => {
    const middleware = rolebasedAccess("ADMIN");
    const req = {};
    let passedError = null;

    middleware(req, {}, (err) => {
        passedError = err;
    });

    assert.ok(passedError instanceof AppError);
    assert.equal(passedError.statusCode, 401);
    assert.equal(passedError.message, "PleaseSign In");
});

test("rolebasedAccess rejects users without a permitted role", () => {
    const middleware = rolebasedAccess("ADMIN", "EMPLOYEE");
    const req = { user: { id: "user-1", role: "CUSTOMER" } };
    let passedError = null;

    middleware(req, {}, (err) => {
        passedError = err;
    });

    assert.ok(passedError instanceof AppError);
    assert.equal(passedError.statusCode, 401);
    assert.equal(passedError.message, "No Permission");
});

test("rolebasedAccess allows users with a permitted role", () => {
    const middleware = rolebasedAccess("ADMIN", "EMPLOYEE");
    const req = { user: { id: "user-2", role: "EMPLOYEE" } };
    let nextCalled = false;
    let passedError = null;

    middleware(req, {}, (err) => {
        nextCalled = true;
        passedError = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(passedError, undefined);
});

test("errorMiddleware maps AppError, ZodError, and PostgreSQL errors cleanly", () => {
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
        const appRes = createMockRes();
        errorMiddleware(new AppError("Conflict detected", 409), {}, appRes, () => {});
        assert.equal(appRes.statusCode, 409);
        assert.deepEqual(appRes.body, {
            success: false,
            message: "Conflict detected",
        });

        const zodRes = createMockRes();
        const zodErr = new Error("Validation");
        zodErr.name = "ZodError";
        zodErr.issues = [{ message: "Subject is required" }];
        errorMiddleware(zodErr, {}, zodRes, () => {});
        assert.equal(zodRes.statusCode, 400);
        assert.deepEqual(zodRes.body, {
            success: false,
            message: "Subject is required",
        });

        const pgUniqueRes = createMockRes();
        errorMiddleware({ cause: { code: "23505" } }, {}, pgUniqueRes, () => {});
        assert.equal(pgUniqueRes.statusCode, 409);
        assert.deepEqual(pgUniqueRes.body, {
            success: false,
            message: "Duplicate value already exists.",
        });

        const pgInvalidIdRes = createMockRes();
        errorMiddleware({ code: "22P02" }, {}, pgInvalidIdRes, () => {});
        assert.equal(pgInvalidIdRes.statusCode, 400);
        assert.deepEqual(pgInvalidIdRes.body, {
            success: false,
            message: "Invalid ID format.",
        });
    } finally {
        console.error = originalConsoleError;
    }
});

