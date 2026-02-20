import { z } from "zod";
import {
  IdSchema,
  OrderStatusSchema,
  UserRoleSchema,
} from "./common.validator";
import { canChangeOrderStatus } from "../auth/permissions/permissions";

export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Название обязательно"),
  class: z.string().min(1, "Класс обязателен"),
  stamp: z.string().min(1, "Марка обязательна"),
  price: z.number().positive("Цена должна быть положительной"),
  quantity: z.number().int().min(1, "Количество минимум 1").default(1),
  total: z.number().positive().optional(),
});

export const CreateOrderSchema = z.object({
  customerId: z.number().int().positive("ID клиента обязательно"),
  items: z
    .array(OrderItemSchema)
    .min(1, "Добавьте хотя бы один товар")
    .max(50, "Слишком много товаров в заказе"),
  totalCost: z
    .number()
    .positive("Общая стоимость должна быть положительной")
    .max(1000000, "Слишком высокая общая стоимость"),
  term: z.coerce
    .date()
    .min(new Date(), "Дата не может быть в прошлом")
    .refine((date) => {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return date <= maxDate;
    }, "Слишком далекая дата"),
  status: OrderStatusSchema.default("PENDING"),
  deliveryAddress: z
    .string()
    .min(5, "Адрес доставки слишком короткий")
    .max(500, "Слишком длинный адрес"),
  deliveryLat: z
    .number()
    .min(-90, "Некорректная широта")
    .max(90, "Некорректная широта")
    .optional()
    .nullable(),
  deliveryLon: z
    .number()
    .min(-180, "Некорректная долгота")
    .max(180, "Некорректная долгота")
    .optional()
    .nullable(),
});

export const ChequeSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, "Добавьте хотя бы один товар")
    .max(50, "Слишком много товаров в заказе"),
  totalCost: z.number().positive("Общая стоимость должна быть положительной"),
  term: z.coerce.date().min(new Date(), "Дата не может быть в прошлом"),
  deliveryAddress: z
    .string()
    .refine((val) => val.length > 0, { message: "Адрес доставки обязателен" })
    .refine((val) => val.length >= 5, {
      message: "Минимальная длина адреса 5 символов",
    }),
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLon: z.number().min(-180).max(180).optional(),
});

export const PaginationSchema = z.object({
  status: OrderStatusSchema,
  page: z
    .number()
    .int("Номер страницы должен быть целым числом")
    .positive("Номер страницы должен быть положительным")
    .default(1),
  limit: z
    .number()
    .int("Лимит должен быть целым числом")
    .min(1, "Лимит должен быть не менее 1")
    .max(100, "Лимит не может превышать 100")
    .default(20),
});

export const GetOrdersSchema = z.object({
  role: UserRoleSchema,
  status: OrderStatusSchema,
  filters: z
    .object({
      page: z
        .number()
        .int("Номер страницы должен быть целым числом")
        .positive("Номер страницы должен быть положительным")
        .default(1),
    })
    .optional(),
});

export const MeOrdersSchema = GetOrdersSchema.extend({
  userId: IdSchema,
});

export const GetUsersSchema = z
  .object({
    requestRole: UserRoleSchema,
    responseRole: UserRoleSchema,
  })
  .refine(
    (data) => data.requestRole === "DISPATCHER" || data.requestRole === "ADMIN",
    {
      message: "Недостаточно прав для получения данных",
      path: ["requestRole"],
    },
  );

export const ChangeOrderStatusSchema = z
  .object({
    orderId: IdSchema,
    role: UserRoleSchema,
    newStatus: OrderStatusSchema,
    currentStatus: OrderStatusSchema,
  })
  .refine(
    (data) =>
      canChangeOrderStatus(data.role, data.currentStatus, data.newStatus),
    {
      message: "Недостаточно прав для изменения статуса",
      path: ["newStatus"],
    },
  );

export const ApprovalOrderSchema = z
  .object({
    orderId: IdSchema,
    dispatcherId: IdSchema,
    courierId: IdSchema,
    role: UserRoleSchema,
    currentStatus: z.literal("PENDING"),
  })
  .refine(
    (data) => {
      return data.currentStatus === "PENDING";
    },
    { message: "Заказ нельзя подтвердить", path: ["currentStatus"] },
  )
  .refine(
    (data) => {
      return data.role === "DISPATCHER" || data.role === "ADMIN";
    },
    {
      message: "Только диспетчер или администратор может подтверждать заказы",
      path: ["role"],
    },
  )
  .refine(
    (data) => {
      return data.courierId > 0;
    },
    { message: "Укажите водителя", path: ["courierId"] },
  );
