import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  email: z.string().trim().min(1, "Email is required").email("Email must be a valid email address"),
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required")
    .transform((value) => value.replace(/\s+/g, ""))
    .refine(
      (value) => /^\d{8}$/.test(value),
      "Contact number must be an 8-digit SG mobile number",
    ),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
