import assert from "node:assert/strict";
import test from "node:test";

import { rolebasedAccess } from "../middlewares/authorize.mjs";
import errorMiddleware from "../middlewares/error.mjs";
import AppError from "../utils/AppError.mjs";

function createMockRes() {
  return {
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
}

test("rolebasedAccess rejects unauthenticated requests with 401", () => {
  const middleware = rolebasedAccess("CUSTOMER");
  let passedError = null;

  middleware({}, {}, (err) => {
    passedError = err;
  });

  assert.ok(passedError instanceof AppError);
  assert.equal(passedError.statusCode, 401);
});

test("rolebasedAccess rejects disallowed roles", () => {
  const middleware = rolebasedAccess("CUSTOMER");
  let passedError = null;

  middleware({ user: { id: "u1", role: "EMPLOYEE" } }, {}, (err) => {
    passedError = err;
  });

  assert.ok(passedError instanceof AppError);
  assert.equal(passedError.statusCode, 401);
  assert.equal(passedError.message, "No Permission");
});

test("rolebasedAccess allows matching role", () => {
  const middleware = rolebasedAccess("CUSTOMER", "EMPLOYEE");
  let passedError;

  middleware({ user: { id: "u1", role: "EMPLOYEE" } }, {}, (err) => {
    passedError = err;
  });

  assert.equal(passedError, undefined);
});

test("errorMiddleware formats AppError, ZodError, and PostgreSQL errors", () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const appRes = createMockRes();
    errorMiddleware(new AppError("Inquiry not found.", 404), {}, appRes, () => {});
    assert.equal(appRes.statusCode, 404);
    assert.deepEqual(appRes.body, {
      success: false,
      message: "Inquiry not found.",
    });

    const zodRes = createMockRes();
    errorMiddleware(
      { name: "ZodError", issues: [{ message: "Subject is required" }] },
      {},
      zodRes,
      () => {},
    );
    assert.equal(zodRes.statusCode, 400);
    assert.deepEqual(zodRes.body, {
      success: false,
      message: "Subject is required",
    });

    const dupRes = createMockRes();
    errorMiddleware({ cause: { code: "23505" } }, {}, dupRes, () => {});
    assert.equal(dupRes.statusCode, 409);
    assert.deepEqual(dupRes.body, {
      success: false,
      message: "Duplicate value already exists.",
    });

    const uuidRes = createMockRes();
    errorMiddleware({ code: "22P02" }, {}, uuidRes, () => {});
    assert.equal(uuidRes.statusCode, 400);
    assert.deepEqual(uuidRes.body, {
      success: false,
      message: "Invalid ID format.",
    });
  } finally {
    console.error = originalConsoleError;
  }
});

