import z from "zod";
import { optionalPhoneValidation } from "./studentsSchema";

export const studentParentSchema = z
  .object({
    student_id: z
      .union([
        z.string().min(1, "Student is required"),
        z.number().min(1, "Student is required"),
      ])
      .refine((val) => val !== "" && val !== 0 && val !== "0", {
        message: "Please select a student",
      }),
    father_name: z.string().optional().or(z.literal("")),
    father_phone: optionalPhoneValidation("Father phone number"),
    mother_name: z.string().optional().or(z.literal("")),
    mother_phone: optionalPhoneValidation("Mother phone number"),
    guardian_name: z.string().optional().or(z.literal("")),
    guardian_phone: optionalPhoneValidation("Guardian phone number"),
  })
  .refine(
    (data) => {
      // Require at least one parent or guardian name
      return Boolean(
        (data.father_name && data.father_name.trim()) ||
        (data.mother_name && data.mother_name.trim()) ||
        (data.guardian_name && data.guardian_name.trim())
      );
    },
    {
      message:
        "At least one parent/guardian name (Father, Mother, or Guardian) must be provided",
      path: ["father_name"],
    }
  );

export type StudentParentFormValues = z.infer<typeof studentParentSchema>;

