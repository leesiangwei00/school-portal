import type { NextFunction, Request, Response } from "express";
import { createClassSchema } from "../validation/class.validation.js";
import * as classService from "../services/class.service.js";

export async function getClasses(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await classService.listClasses();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function postClass(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createClassSchema.parse(req.body);
    const cls = await classService.createClass(input);
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
}

export async function getClass(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const cls = await classService.getClassById(req.params.id);
    res.status(200).json(cls);
  } catch (err) {
    next(err);
  }
}

export async function putClass(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const input = createClassSchema.parse(req.body);
    const cls = await classService.updateClass(req.params.id, input);
    res.status(200).json(cls);
  } catch (err) {
    next(err);
  }
}

export async function deleteClass(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await classService.deleteClass(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
