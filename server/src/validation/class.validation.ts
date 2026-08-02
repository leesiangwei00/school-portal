import { z } from "zod";

export const createClassSchema = z.object({
  level: z.string().trim().min(1, "Level is required"),
  name: z.string().trim().min(1, "Class name is required"),
  teacherEmail: z
    .string()
    .trim()
    .min(1, "Teacher email is required")
    .email("Teacher email must be a valid email address"),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
