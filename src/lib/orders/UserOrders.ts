import { IClientResponse, UserRole } from "@/types";
import User from "../models/userModel";
import { authHelper } from "../utils/auth-helper";
import {
  ChangeOrderStatusSchema,
  MeOrdersSchema,
} from "../validators/orders.validator";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zod-error-formatter";
import { UserRoleSchema } from "../validators/common.validator";

export default class UserOrders {
  static async getDetailsOrder(orderId: number): Promise<IClientResponse> {
    try {
      const isAuth: IClientResponse = await authHelper();
      if (!isAuth.success) {
        return {
          success: false,
          message: isAuth.message || "Требуется аутентификация",
          status: isAuth.status,
        };
      }

      const res = await User.getDetailsOrder(orderId);
      return {
        success: res.success,
        message: res.message,
        status: res.status,
        order: res.order,
      };
    } catch (error) {
      return {
        success: false,
        message: "Внутренняя ошибка сервера | service",
        status: 500,
      };
    }
  }

  static async changeOrderStatus(
    orderId: number,
    role: UserRole,
    newStatus: OrderStatus,
    currentStatus: OrderStatus,
  ): Promise<IClientResponse> {
    try {
      const validData = ChangeOrderStatusSchema.parse({
        orderId,
        role,
        newStatus,
        currentStatus,
      });
      const orderCheck = await User.checkExistenceOrder(validData.orderId);
      if (!orderCheck.success) {
        return orderCheck;
      }
      const isAuth: IClientResponse = await authHelper(
        currentStatus,
        validData.newStatus,
      );
      if (!isAuth.success) {
        return {
          success: false,
          message: isAuth.message,
          status: isAuth.status,
        };
      }
      const res = await User.changeOrderStatus(
        validData.orderId,
        validData.role,
        validData.newStatus,
        validData.currentStatus,
      );
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

  static async getOrders(
    role: UserRole,
    status: OrderStatus,
    filters?: {
      page?: number;
    },
  ): Promise<IClientResponse> {
    try {
      const validRole = UserRoleSchema.parse(role);
      const isAuth: IClientResponse = await authHelper();
      if (!isAuth.success) {
        return {
          success: false,
          message: isAuth.message || "Требуется аутентификация",
          status: 401,
        };
      }
      if (!isAuth.user) {
        return {
          success: false,
          message: isAuth.message || "Данные пользователя не найдены",
          status: 404,
        };
      }
      const validData = MeOrdersSchema.parse({
        userId: isAuth.user.id,
        role: validRole,
        status,
        filters,
      });
      const res = await User.getOrders(
        validData.userId,
        validData.role,
        validData.status,
        filters,
      );
      if (res.success && res.orders) {
        return {
          success: res.success || true,
          message: res.message || `Заказов: ${res.orders.length || 0}`,
          status: 200,
          orders: res.orders || [],
          meta: res.meta,
        };
      }
      return {
        success: res.success || false,
        message: res.message || "Заказов пока нет",
        status: 404,
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
