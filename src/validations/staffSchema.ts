import z from "zod";
import { emailValidation, optionalPhoneValidation } from "./studentsSchema";

export const staffDetailsSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  email: emailValidation,
  phone: optionalPhoneValidation("Phone number"),
  emergency_mobile: optionalPhoneValidation("Emergency mobile"),
});
