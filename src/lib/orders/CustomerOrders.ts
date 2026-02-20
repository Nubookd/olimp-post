import { ICheque, IClientResponse } from "@/types";
import Customer from "../models/customerModel";
import { authHelper } from "@/utils/auth-helper";
import UserOrders from "./UserOrders";
import { CreateOrderSchema } from "../validators/orders.validator";
import { formatZodError } from "@/utils/zod-error-formatter";
import { ZodError } from "zod";

export default class CustomerOrders extends UserOrders {
  static async createOrder(order: ICheque): Promise<IClientResponse> {
    try {
      const isAuth: IClientResponse = await authHelper();
      if (!isAuth.success) {
        return {
          success: false,
          message: isAuth.message || "Требуется аутентификация",
          status: 401,
        };
      }
      if (!isAuth.user?.id) {
        return {
          success: false,
          message: "Не удалось определить пользователя",
          status: 401,
        };
      }
      if (!order.deliveryAddress?.trim()) {
        return {
          success: false,
          message: "Не указан адрес доставки",
          status: 400,
        };
      }

      const orderCreateItem = {
        customerId: isAuth.user.id,
        items: order.items,
        totalCost: order.totalCost,
        term: order.term,
        status: "PENDING",
        deliveryAddress: order.deliveryAddress,
        deliveryLat: order.deliveryLat ?? 0,
        deliveryLon: order.deliveryLon ?? 0,
      };
      const validData = CreateOrderSchema.parse(orderCreateItem);
      const res = await Customer.createOrder(validData);
      return {
        success: res.success,
        message: res.message,
        status: res.status,
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
