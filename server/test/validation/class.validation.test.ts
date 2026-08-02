import { describe, expect, it } from "vitest";
import { createClassSchema } from "../../src/validation/class.validation.js";

describe("createClassSchema", () => {
  it("accepts a valid input and trims whitespace", () => {
    const result = createClassSchema.parse({
      level: "  Primary 1  ",
      name: "  Class 1A  ",
      teacherEmail: "  teachermary@gmail.com  ",
    });

    expect(result).toEqual({
      level: "Primary 1",
      name: "Class 1A",
      teacherEmail: "teachermary@gmail.com",
    });
  });

  it("rejects an empty level", () => {
    const result = createClassSchema.safeParse({
      level: "",
      name: "Class 1A",
      teacherEmail: "teachermary@gmail.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    const result = createClassSchema.safeParse({
      level: "Primary 1",
      name: "   ",
      teacherEmail: "teachermary@gmail.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid teacher email", () => {
    const result = createClassSchema.safeParse({
      level: "Primary 1",
      name: "Class 1A",
      teacherEmail: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing teacher email", () => {
    const result = createClassSchema.safeParse({
      level: "Primary 1",
      name: "Class 1A",
      teacherEmail: "",
    });

    expect(result.success).toBe(false);
  });
});
