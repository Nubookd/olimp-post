import { IClientResponse, IOrderCreateItem } from "@/types";
import User from "./userModel";
import { prisma } from "../../../prisma/prisma";
import { Prisma } from "@prisma/client";
import { CreateOrderSchema } from "../validators/orders.validator";
import { ZodError } from "zod";
import { formatZodError } from "@/utils/zod-error-formatter";

export default class Customer extends User {
  static async createOrder(data: IOrderCreateItem): Promise<IClientResponse> {
    try {
      const validData = CreateOrderSchema.parse(data);
      const res = await prisma.orders.create({
        data: {
          customerId: validData.customerId,
          items: { items: validData.items } as Prisma.InputJsonValue,
          totalCost: validData.totalCost,
          status: validData.status || "PENDING",
          term: validData.term,
          deliveryAddress: validData.deliveryAddress,
          deliveryLat: validData.deliveryLat,
          deliveryLon: validData.deliveryLon,
        },
      });
      if (!res) {
        return {
          success: false,
          message: "Ошибка при создании заказа",
          status: 404,
        };
      }
      return {
        success: true,
        message: "Заказ успешно создан",
        status: 200,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return formatZodError(error);
      }
      return {
        success: false,
        message: "Внутренняя ошибка сервера | service",
        status: 500,
      };
    }
  }
}
