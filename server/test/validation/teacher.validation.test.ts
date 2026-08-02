import { describe, expect, it } from "vitest";
import { createTeacherSchema } from "../../src/validation/teacher.validation.js";

const valid = {
  name: "Mary",
  subject: "Mathematics",
  email: "teachermary@gmail.com",
  contactNumber: "91234567",
};

describe("createTeacherSchema", () => {
  it("accepts a valid input", () => {
    const result = createTeacherSchema.parse(valid);

    expect(result).toEqual(valid);
  });

  it("strips whitespace out of the contact number", () => {
    const result = createTeacherSchema.parse({ ...valid, contactNumber: "9123 4567" });

    expect(result.contactNumber).toBe("91234567");
  });

  it("rejects a contact number that isn't 8 digits", () => {
    const result = createTeacherSchema.safeParse({ ...valid, contactNumber: "123" });

    expect(result.success).toBe(false);
  });

  it("rejects a contact number containing non-digit characters", () => {
    const result = createTeacherSchema.safeParse({ ...valid, contactNumber: "9123abc7" });

    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createTeacherSchema.safeParse({ ...valid, name: "" });

    expect(result.success).toBe(false);
  });

  it("rejects an empty subject", () => {
    const result = createTeacherSchema.safeParse({ ...valid, subject: "  " });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createTeacherSchema.safeParse({ ...valid, email: "not-an-email" });

    expect(result.success).toBe(false);
  });
});
