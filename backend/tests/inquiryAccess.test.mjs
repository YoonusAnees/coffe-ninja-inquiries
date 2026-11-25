import test from "node:test";
import assert from "node:assert/strict";
import { rolebasedAccess } from "../middlewares/authorize.mjs";
import AppError from "../utils/AppError.mjs";

test("rolebasedAccess blocks CUSTOMER from ADMIN-only endpoints with 401", () => {
    const middleware = rolebasedAccess("ADMIN");
    const req = { user: { id: "user-1", role: "CUSTOMER" } };
    let capturedError = null;

    middleware(req, {}, (err) => {
        capturedError = err;
    });

    assert.ok(capturedError instanceof AppError);
    assert.equal(capturedError.statusCode, 401);
    assert.equal(capturedError.message, "No Permission");
});

test("rolebasedAccess allows EMPLOYEE on EMPLOYEE-scoped endpoints", () => {
    const middleware = rolebasedAccess("EMPLOYEE");
    const req = { user: { id: "emp-1", role: "EMPLOYEE" } };
    let nextCalled = false;
    let capturedError = null;

    middleware(req, {}, (err) => {
        nextCalled = true;
        capturedError = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(capturedError, undefined);
});