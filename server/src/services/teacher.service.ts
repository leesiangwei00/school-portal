import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ConflictError, NotFoundError } from "../errors.js";
import type { CreateTeacherInput } from "../validation/teacher.validation.js";

export interface TeacherDto {
  id: string;
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

function toDto(teacher: {
  id: string;
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}): TeacherDto {
  return {
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    email: teacher.email,
    contactNumber: teacher.contactNumber,
  };
}

function handleUniqueConstraintError(err: unknown, input: CreateTeacherInput): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = err.meta?.target;
    const fields = Array.isArray(target) ? target : typeof target === "string" ? [target] : [];
    if (fields.includes("contactNumber")) {
      throw new ConflictError(
        `A teacher with contact number "${input.contactNumber}" already exists`,
      );
    }
    throw new ConflictError(`A teacher with email "${input.email}" already exists`);
  }
  throw err;
}

export async function listTeachers(): Promise<TeacherDto[]> {
  const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: "asc" } });
  return teachers.map(toDto);
}

export async function getTeacherById(id: string): Promise<TeacherDto> {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw new NotFoundError(`No teacher found with id "${id}"`);
  }
  return toDto(teacher);
}

export async function createTeacher(input: CreateTeacherInput): Promise<TeacherDto> {
  try {
    const teacher = await prisma.teacher.create({ data: input });
    return toDto(teacher);
  } catch (err) {
    handleUniqueConstraintError(err, input);
  }
}

export async function updateTeacher(id: string, input: CreateTeacherInput): Promise<TeacherDto> {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`No teacher found with id "${id}"`);
  }

  try {
    const teacher = await prisma.teacher.update({ where: { id }, data: input });
    return toDto(teacher);
  } catch (err) {
    handleUniqueConstraintError(err, input);
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`No teacher found with id "${id}"`);
  }

  try {
    await prisma.teacher.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new ConflictError(
        `Teacher "${existing.name}" is the form teacher of a class; reassign or delete that class first`,
      );
    }
    throw err;
  }
}
