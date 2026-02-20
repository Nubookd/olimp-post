import z from "zod";
import {
  EmailSchema,
  LoginSchema,
  PasswordSchema,
  UserRoleSchema,
} from "./common.validator";

export const LoginUserSchema = z.object({
  login: LoginSchema,
  password: PasswordSchema,
});

export const RegisterUserSchema = z.object({
  login: LoginSchema,
  email: EmailSchema,
  password: PasswordSchema,
  role: UserRoleSchema,
});

export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(10, "Токен слишком короткий")
    .max(500, "Токен слишком длинный"),
});
