import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "../../src/errors.js";

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    class: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
  },
}));

const { prisma } = await import("../../src/lib/prisma.js");
const {
  listClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = await import("../../src/services/class.service.js");

const teacher = {
  id: "teacher-1",
  name: "Mary",
  email: "teachermary@gmail.com",
};

const dbClass = {
  id: "class-1",
  level: "Primary 1",
  name: "Class 1A",
  teacher,
};

const input = { level: "Primary 1", name: "Class 1A", teacherEmail: "teachermary@gmail.com" };

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

describe("listClasses", () => {
  it("maps classes to DTOs with nested form teacher", async () => {
    vi.mocked(prisma.class.findMany).mockResolvedValue([dbClass] as never);

    const result = await listClasses();

    expect(result).toEqual([
      {
        id: "class-1",
        level: "Primary 1",
        name: "Class 1A",
        formTeacher: { name: "Mary", email: "teachermary@gmail.com" },
      },
    ]);
  });
});

describe("getClassById", () => {
  it("returns the DTO when found", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue(dbClass as never);

    const result = await getClassById("class-1");

    expect(result.id).toBe("class-1");
  });

  it("throws NotFoundError when missing", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

    await expect(getClassById("missing")).rejects.toThrow(NotFoundError);
  });
});

describe("createClass", () => {
  it("throws NotFoundError when the teacher email is unknown", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

    await expect(createClass(input)).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when the teacher is already a form teacher", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.findUnique).mockResolvedValue(dbClass as never);

    await expect(createClass(input)).rejects.toThrow(ConflictError);
  });

  it("creates the class when the teacher is free", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.class.create).mockResolvedValue(dbClass as never);

    const result = await createClass(input);

    expect(prisma.class.create).toHaveBeenCalledWith({
      data: { level: "Primary 1", name: "Class 1A", teacherId: "teacher-1" },
      include: { teacher: true },
    });
    expect(result.formTeacher).toEqual({ name: "Mary", email: "teachermary@gmail.com" });
  });

  it("maps a P2002 race condition on create to ConflictError", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.class.create).mockRejectedValue(knownRequestError("P2002"));

    await expect(createClass(input)).rejects.toThrow(ConflictError);
  });

  it("rethrows unrelated errors from create", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);
    const unrelated = new Error("connection lost");
    vi.mocked(prisma.class.create).mockRejectedValue(unrelated);

    await expect(createClass(input)).rejects.toThrow(unrelated);
  });
});

describe("updateClass", () => {
  it("throws NotFoundError when the class does not exist", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

    await expect(updateClass("class-1", input)).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the teacher email is unknown", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValueOnce(dbClass as never);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

    await expect(updateClass("class-1", input)).rejects.toThrow(NotFoundError);
  });

  it("allows keeping the same form teacher on the same class", async () => {
    vi.mocked(prisma.class.findUnique)
      .mockResolvedValueOnce(dbClass as never)
      .mockResolvedValueOnce(dbClass as never);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.update).mockResolvedValue(dbClass as never);

    const result = await updateClass("class-1", input);

    expect(result.id).toBe("class-1");
  });

  it("throws ConflictError when reassigning to a teacher on a different class", async () => {
    vi.mocked(prisma.class.findUnique)
      .mockResolvedValueOnce(dbClass as never)
      .mockResolvedValueOnce({ ...dbClass, id: "class-2" } as never);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);

    await expect(updateClass("class-1", input)).rejects.toThrow(ConflictError);
  });

  it("maps a P2002 race condition on update to ConflictError", async () => {
    vi.mocked(prisma.class.findUnique)
      .mockResolvedValueOnce(dbClass as never)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    vi.mocked(prisma.class.update).mockRejectedValue(knownRequestError("P2002"));

    await expect(updateClass("class-1", input)).rejects.toThrow(ConflictError);
  });

  it("rethrows unrelated errors from update", async () => {
    vi.mocked(prisma.class.findUnique)
      .mockResolvedValueOnce(dbClass as never)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(teacher as never);
    const unrelated = new Error("connection lost");
    vi.mocked(prisma.class.update).mockRejectedValue(unrelated);

    await expect(updateClass("class-1", input)).rejects.toThrow(unrelated);
  });
});

describe("deleteClass", () => {
  it("throws NotFoundError when the class does not exist", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue(null);

    await expect(deleteClass("missing")).rejects.toThrow(NotFoundError);
  });

  it("deletes the class when it exists", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue(dbClass as never);
    vi.mocked(prisma.class.delete).mockResolvedValue(dbClass as never);

    await deleteClass("class-1");

    expect(prisma.class.delete).toHaveBeenCalledWith({ where: { id: "class-1" } });
  });
});
