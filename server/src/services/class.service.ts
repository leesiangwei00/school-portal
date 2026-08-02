import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ConflictError, NotFoundError } from "../errors.js";
import type { CreateClassInput } from "../validation/class.validation.js";

export interface ClassDto {
  id: string;
  level: string;
  name: string;
  formTeacher: {
    name: string;
    email: string;
  };
}

function toDto(cls: {
  id: string;
  level: string;
  name: string;
  teacher: { name: string; email: string };
}): ClassDto {
  return {
    id: cls.id,
    level: cls.level,
    name: cls.name,
    formTeacher: { name: cls.teacher.name, email: cls.teacher.email },
  };
}

export async function listClasses(): Promise<ClassDto[]> {
  const classes = await prisma.class.findMany({
    include: { teacher: true },
    orderBy: { createdAt: "asc" },
  });
  return classes.map(toDto);
}

export async function getClassById(id: string): Promise<ClassDto> {
  const cls = await prisma.class.findUnique({ where: { id }, include: { teacher: true } });
  if (!cls) {
    throw new NotFoundError(`No class found with id "${id}"`);
  }
  return toDto(cls);
}

export async function createClass(input: CreateClassInput): Promise<ClassDto> {
  const teacher = await prisma.teacher.findUnique({ where: { email: input.teacherEmail } });
  if (!teacher) {
    throw new NotFoundError(`No teacher found with email "${input.teacherEmail}"`);
  }

  const existingClass = await prisma.class.findUnique({ where: { teacherId: teacher.id } });
  if (existingClass) {
    throw new ConflictError(`Teacher "${teacher.name}" is already the form teacher of another class`);
  }

  try {
    const created = await prisma.class.create({
      data: {
        level: input.level,
        name: input.name,
        teacherId: teacher.id,
      },
      include: { teacher: true },
    });
    return toDto(created);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError(`Teacher "${teacher.name}" is already the form teacher of another class`);
    }
    throw err;
  }
}

export async function updateClass(id: string, input: CreateClassInput): Promise<ClassDto> {
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`No class found with id "${id}"`);
  }

  const teacher = await prisma.teacher.findUnique({ where: { email: input.teacherEmail } });
  if (!teacher) {
    throw new NotFoundError(`No teacher found with email "${input.teacherEmail}"`);
  }

  const existingClass = await prisma.class.findUnique({ where: { teacherId: teacher.id } });
  if (existingClass && existingClass.id !== id) {
    throw new ConflictError(`Teacher "${teacher.name}" is already the form teacher of another class`);
  }

  try {
    const updated = await prisma.class.update({
      where: { id },
      data: {
        level: input.level,
        name: input.name,
        teacherId: teacher.id,
      },
      include: { teacher: true },
    });
    return toDto(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError(`Teacher "${teacher.name}" is already the form teacher of another class`);
    }
    throw err;
  }
}

export async function deleteClass(id: string): Promise<void> {
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`No class found with id "${id}"`);
  }

  await prisma.class.delete({ where: { id } });
}
