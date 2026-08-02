import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "../../src/errors.js";

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    teacher: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const { prisma } = await import("../../src/lib/prisma.js");
const {
  listTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = await import("../../src/services/teacher.service.js");

const dbTeacher = {
  id: "teacher-1",
  name: "Mary",
  subject: "Mathematics",
  email: "teachermary@gmail.com",
  contactNumber: "91234567",
};

const input = {
  name: "Mary",
  subject: "Mathematics",
  email: "teachermary@gmail.com",
  contactNumber: "91234567",
};

function knownRequestError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError("db error", {
    code,
    clientVersion: "6.1.0",
    meta,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("listTeachers", () => {
  it("maps teachers to DTOs", async () => {
    vi.mocked(prisma.teacher.findMany).mockResolvedValue([dbTeacher] as never);

    const result = await listTeachers();

    expect(result).toEqual([dbTeacher]);
  });
});

describe("getTeacherById", () => {
  it("returns the DTO when found", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);

    const result = await getTeacherById("teacher-1");

    expect(result.email).toBe("teachermary@gmail.com");
  });

  it("throws NotFoundError when missing", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

    await expect(getTeacherById("missing")).rejects.toThrow(NotFoundError);
  });
});

describe("createTeacher", () => {
  it("creates the teacher on success", async () => {
    vi.mocked(prisma.teacher.create).mockResolvedValue(dbTeacher as never);

    const result = await createTeacher(input);

    expect(prisma.teacher.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(dbTeacher);
  });

  it("maps a P2002 on contactNumber to a contact-number ConflictError", async () => {
    vi.mocked(prisma.teacher.create).mockRejectedValue(
      knownRequestError("P2002", { target: ["contactNumber"] }),
    );

    await expect(createTeacher(input)).rejects.toThrow(ConflictError);
    await expect(createTeacher(input)).rejects.toThrow(/contact number/);
  });

  it("maps a P2002 on email to an email ConflictError", async () => {
    vi.mocked(prisma.teacher.create).mockRejectedValue(
      knownRequestError("P2002", { target: ["email"] }),
    );

    await expect(createTeacher(input)).rejects.toThrow(ConflictError);
    await expect(createTeacher(input)).rejects.toThrow(/email/);
  });

  it("falls back to an email ConflictError when meta.target has no fields", async () => {
    vi.mocked(prisma.teacher.create).mockRejectedValue(knownRequestError("P2002", {}));

    await expect(createTeacher(input)).rejects.toThrow(ConflictError);
    await expect(createTeacher(input)).rejects.toThrow(/email/);
  });

  it("rethrows unrelated errors", async () => {
    const unrelated = new Error("connection lost");
    vi.mocked(prisma.teacher.create).mockRejectedValue(unrelated);

    await expect(createTeacher(input)).rejects.toThrow(unrelated);
  });
});

describe("updateTeacher", () => {
  it("throws NotFoundError when the teacher does not exist", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

    await expect(updateTeacher("missing", input)).rejects.toThrow(NotFoundError);
  });

  it("updates the teacher on success", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);
    vi.mocked(prisma.teacher.update).mockResolvedValue(dbTeacher as never);

    const result = await updateTeacher("teacher-1", input);

    expect(result.id).toBe("teacher-1");
  });

  it("maps a P2002 to ConflictError", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);
    vi.mocked(prisma.teacher.update).mockRejectedValue(
      knownRequestError("P2002", { target: ["email"] }),
    );

    await expect(updateTeacher("teacher-1", input)).rejects.toThrow(ConflictError);
  });
});

describe("deleteTeacher", () => {
  it("throws NotFoundError when the teacher does not exist", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

    await expect(deleteTeacher("missing")).rejects.toThrow(NotFoundError);
  });

  it("deletes the teacher when it exists", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);
    vi.mocked(prisma.teacher.delete).mockResolvedValue(dbTeacher as never);

    await deleteTeacher("teacher-1");

    expect(prisma.teacher.delete).toHaveBeenCalledWith({ where: { id: "teacher-1" } });
  });

  it("maps a P2003 foreign-key violation to ConflictError", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);
    vi.mocked(prisma.teacher.delete).mockRejectedValue(knownRequestError("P2003"));

    await expect(deleteTeacher("teacher-1")).rejects.toThrow(ConflictError);
  });

  it("rethrows unrelated errors", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(dbTeacher as never);
    const unrelated = new Error("connection lost");
    vi.mocked(prisma.teacher.delete).mockRejectedValue(unrelated);

    await expect(deleteTeacher("teacher-1")).rejects.toThrow(unrelated);
  });
});
