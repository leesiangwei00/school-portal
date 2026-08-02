import type { Request, Response } from "express";
import { z } from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError, ValidationError } from "../../src/errors.js";
import { errorHandler, notFoundHandler } from "../../src/middleware/errorHandler.js";

function createMockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const req = {} as Request;
const next = vi.fn();

describe("notFoundHandler", () => {
  it("responds with 404 and a generic message", () => {
    const res = createMockResponse();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
  });
});

describe("errorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds with 400 and the first issue message for a ZodError", () => {
    const res = createMockResponse();
    const schema = z.object({ name: z.string().min(1, "Name is required") });
    const zodError = schema.safeParse({ name: "" }).error!;

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
  });

  it.each([
    [new NotFoundError("not found"), 404],
    [new ConflictError("conflict"), 409],
    [new ValidationError("invalid"), 400],
  ])("maps %o to status %d", (err, status) => {
    const res = createMockResponse();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ error: err.message });
  });

  it("responds with 500 and logs unknown errors", () => {
    const res = createMockResponse();
    const err = new Error("boom");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
