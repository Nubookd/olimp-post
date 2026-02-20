import { z } from "zod";

export interface FormattedZodError {
  success: false;
  message: string;
  errors: Record<string, string>;
  status: 400;
}

export const formatZodError = (error: z.ZodError): FormattedZodError => {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  });
  const firstErrorMessage = error.issues[0]?.message || "Ошибка валидации";
  return {
    success: false,
    message: "Проверьте данные",
    errors,
    status: 400,
  };
};
