import type { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny, data: any) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const field = err.path[0] as string;
      errors[field] = err.message;
    });

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    errors: {},
  };
};

// export const validate = (schema: any, data: any) => {
//   const result = schema.safeParse(data);

//   console.log("result", result);

//   if (!result.success) {
//     const errors: Record<string, string> = {};

//     result.error.errors.forEach((err: any) => {
//       errors[err.path[0]] = err.message;
//     });

//     return errors;
//   }

//   return null;
// };
