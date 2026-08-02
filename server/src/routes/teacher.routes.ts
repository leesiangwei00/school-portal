import { Router } from "express";
import {
  deleteTeacher,
  getTeacher,
  getTeachers,
  postTeacher,
  putTeacher,
} from "../controllers/teacher.controller.js";

export const teacherRouter = Router();

teacherRouter.get("/", getTeachers);
teacherRouter.post("/", postTeacher);
teacherRouter.get("/:id", getTeacher);
teacherRouter.put("/:id", putTeacher);
teacherRouter.delete("/:id", deleteTeacher);
