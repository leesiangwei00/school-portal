import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { teacherRouter } from "./routes/teacher.routes.js";
import { classRouter } from "./routes/class.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/teachers", teacherRouter);
  app.use("/api/classes", classRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
