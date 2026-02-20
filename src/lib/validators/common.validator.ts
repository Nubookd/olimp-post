import z from "zod";

export const UserRoleSchema = z
  .enum(["ADMIN", "CUSTOMER", "OPERATOR", "DISPATCHER", "COURIER"])
  .default("CUSTOMER");

export const OrderStatusSchema = z
  .enum(["PENDING", "AGREED", "SHIPPED", "DELIVERED", "CANCELLED"])
  .default("PENDING");

export const IdSchema = z.coerce
  .number()
  .int("Id должно быть целым числом")
  .positive("Id должно быть положительным числом");

export const LoginSchema = z
  .string()
  .trim()
  .refine((val) => val.length > 0, { message: "Логин обязателен" })
  .refine((val) => val.length >= 6, {
    message: "Минимальная длина логина 6 символов",
  })
  .max(100, "Слишком длинный email");

export const EmailSchema = z
  .string()
  .trim()
  .refine((val) => val.length > 0, { message: "Email обязателен" })
  .email("Введите корректный email")
  .max(100, "Слишком длинный email")
  .toLowerCase();

export const PasswordSchema = z
  .string()
  .refine((val) => val.length > 0, { message: "Пароль обязателен" })
  .refine((val) => val.length >= 8, {
    message: "Минимальная длина пароля 8 символов",
  })
  .max(50, "Пароль слишком длинный")
  .refine((val) => val.length === 0 || /[A-Z]/.test(val), {
    message: "Должна быть хотя бы одна заглавная буква",
  })
  .refine((val) => val.length === 0 || /[0-9]/.test(val), {
    message: "Должна быть хотя бы одна цифра",
  })
  .refine((val) => val.length === 0 || /[^A-Za-z0-9]/.test(val), {
    message: "Должен быть хотя бы один специальный символ",
  });

export const UserPublicSchema = z.object({
  id: IdSchema,
  login: LoginSchema,
  email: EmailSchema,
  role: UserRoleSchema,
});

export const UserSchema = UserPublicSchema.extend({
  hash: z
    .string()
    .length(60, "Хеш пароля должен быть ровно 60 символов")
    .regex(/^\$2[aby]\$\d+\$/, "Неверный формат bcrypt хеша"),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
});

export const OrderItemSchema = z.object({
  productId: IdSchema,
  name: z.string().min(1, "Название товара обязательно"),
  quantity: z
    .number()
    .int("Количество должно быть целым числом")
    .min(1, "Минимальное количество: 1"),
  price: z
    .number()
    .positive("Цена должна быть положительной")
    .max(1000000, "Слишком высокая цена"),
  total: z.number().positive().optional(),
});

export const PhoneSchema = z
  .string()
  .regex(/^\+7|8\d{10}$/, "Невалидный формат номера телефона");
