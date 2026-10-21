import z from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;

export const emailValidation = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((val) => !val || emailRegex.test(String(val).trim()), {
    message: "Enter a valid email address",
  });

export const requiredPhoneValidation = (fieldLabel: string) =>
  z
    .string()
    .min(1, `${fieldLabel} is required`)
    .refine((val) => phoneRegex.test(String(val).trim()), {
      message: `${fieldLabel} must be a valid 10-digit number`,
    });

export const optionalPhoneValidation = (fieldLabel: string = "Phone number") =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || phoneRegex.test(String(val).trim()), {
      message: `${fieldLabel} must be a valid 10-digit number`,
    });

// Add student schema.
export const studentPersonalDetailsSchema = z.object({
  email: emailValidation,
  academic_year_id: z.number({ error: "Must be a number" }).min(1, "Academic year is required"),
  class_id: z.number({ error: "Must be a number" }).min(1, "Class is required"),
  section_id: z.number({ error: "Must be a number" }).min(1, "Section is required"),
  admission_no: z.string().min(1, "Admission number is required"),
  admission_date: z.date({ error: "Admission date is required" }).min(new Date("1900-01-01"), "Admission date is required"),
  roll_no: z.string().min(1, "Roll number is required"),
  full_name: z.string().min(1, "Full name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.date({ error: "DOB is required" }).min(new Date("1900-01-01"), "DOB is required"),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),

  current_address: z.string().min(1, "Current address is required"),
  permanent_address: z.string().min(1, "Permanent address is required"),
  blood_group: z.string().optional(),
});

export const studentFamilyDetailsSchema = z.object({
  father_name: z.string().min(1, "Father name is required"),
  father_phone: requiredPhoneValidation("Father phone number"),
  father_email: emailValidation,

  mother_name: z.string().min(1, "Mother name is required"),
  mother_phone: requiredPhoneValidation("Mother phone number"),
  mother_email: emailValidation,

  guardian_name: z.string().optional(),
  guardian_phone: optionalPhoneValidation("Guardian phone number"),
  guardian_relation: z.string().optional(),
  guardian_email: emailValidation,
  guardian_address: z.string().optional(),
});
