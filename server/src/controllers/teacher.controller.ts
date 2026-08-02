import type { NextFunction, Request, Response } from "express";
import { createTeacherSchema } from "../validation/teacher.validation.js";
import * as teacherService from "../services/teacher.service.js";

export async function getTeachers(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await teacherService.listTeachers();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function postTeacher(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createTeacherSchema.parse(req.body);
    const teacher = await teacherService.createTeacher(input);
    res.status(201).json(teacher);
  } catch (err) {
    next(err);
  }
}

export async function getTeacher(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.status(200).json(teacher);
  } catch (err) {
    next(err);
  }
}

export async function putTeacher(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const input = createTeacherSchema.parse(req.body);
    const teacher = await teacherService.updateTeacher(req.params.id, input);
    res.status(200).json(teacher);
  } catch (err) {
    next(err);
  }
}

export async function deleteTeacher(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await teacherService.deleteTeacher(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
