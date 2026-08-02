import { Router } from "express";
import {
  deleteClass,
  getClass,
  getClasses,
  postClass,
  putClass,
} from "../controllers/class.controller.js";

export const classRouter = Router();

classRouter.get("/", getClasses);
classRouter.post("/", postClass);
classRouter.get("/:id", getClass);
classRouter.put("/:id", putClass);
classRouter.delete("/:id", deleteClass);
