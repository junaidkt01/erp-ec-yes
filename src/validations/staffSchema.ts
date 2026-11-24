import z from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;

export const staffDetailsSchema = z.object({
  full_name: z
    .string({ error: "Full name is required" })
    .min(1, "Full name is required"),
  email: z
    .string()
    .nullable()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || emailRegex.test(String(val).trim()), {
      message: "Enter a valid email address",
    }),
  phone: z
    .string()
    .nullable()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || phoneRegex.test(String(val).trim()), {
      message: "Phone number must be a valid 10-digit number",
    }),
  emergency_mobile: z
    .string()
    .nullable()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || phoneRegex.test(String(val).trim()), {
      message: "Emergency mobile must be a valid 10-digit number",
    }),
});
