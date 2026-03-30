import { describe, it, expect } from "vitest";
import { ApiError } from "@/lib/api-utils";

describe("ApiError", () => {
  it("creates error with message and status code", () => {
    const error = new ApiError("Not found", 404);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });

  it("defaults to status 400", () => {
    const error = new ApiError("Bad request");
    expect(error.statusCode).toBe(400);
  });

  it("is an instance of Error", () => {
    const error = new ApiError("Test");
    expect(error).toBeInstanceOf(Error);
  });
});
