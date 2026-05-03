import z from "zod";

// Add student schema.
export const studentPersonalDetailsSchema = z.object({
  email: z.string().optional(),
  academic_year_id: z.number().min(1, "Academic year is required"),
  class_id: z.number().min(1, "Class is required"),
  section_id: z.number().min(1, "Section is required"),
  admission_no: z.string().min(1, "Admission number is required"),
  // admission_date: z.date().optional(),
  admission_date: z.date().min(1, "Admission date is required"),
  roll_no: z.string().min(1, "Roll number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),

  current_address: z.string().min(1, "Current address is required"),
  permanent_address: z.string().min(1, "Permanent address is required"),
  blood_group: z.string().optional(),
});

export const studentFamilyDetailsSchema = z.object({
  father_name: z.string().min(1, "Father name is required"),
  father_phone: z.string().min(1, "Father phone is required"),
  mother_name: z.string().min(1, "Mother name is required"),
  mother_phone: z.string().min(1, "Mother phone is required"),

  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_relation: z.string().optional(),
  guardian_email: z.string().optional(),
  guardian_address: z.string().optional()

  // guardian_name: z.string().min(1, "Guardian name is required"),
  // guardian_phone: z.string().min(1, "Guardian phone is required"),
  // guardian_relation: z.string().min(1, "Guardian relation is required"),
  // guardian_email: z.string().min(1, "Guardian email is required"),
  // guardian_address: z.string().min(1, "Guardian address is required")
});
