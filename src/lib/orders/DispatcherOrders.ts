import { IClientResponse, OrderStatus, UserRole } from "@/types";
import CustomerOrders from "./CustomerOrders";
import {
  ApprovalOrderSchema,
  GetUsersSchema,
} from "../validators/orders.validator";
import { authHelper } from "../utils/auth-helper";
import Dispatcher from "../models/dispatcherModel";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zod-error-formatter";

export default class DispatcherOrders extends CustomerOrders {
  static async approvalOrder(
    orderId: number,
    dispatcherId: number,
    courierId: number,
    role: UserRole,
    currentStatus: OrderStatus,
  ): Promise<IClientResponse> {
    try {
      const validData = ApprovalOrderSchema.parse({
        orderId,
        dispatcherId,
        courierId,
        role,
        currentStatus,
      });
      const isAuth = await authHelper(validData.currentStatus, "AGREED");
      if (!isAuth.success) {
        return {
          success: false,
          message: isAuth.message,
          status: isAuth.status,
        };
      }

      const res = await Dispatcher.approvalOrder(
        validData.orderId,
        validData.dispatcherId,
        validData.courierId,
        validData.role,
        validData.currentStatus,
      );
      return {
        success: res.success,
        message: res.message,
        status: res.status,
        order: res.order,
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

  static async getUsers(
    requestRole: UserRole,
    responseRole: UserRole,
  ): Promise<IClientResponse> {
    try {
      const validData = GetUsersSchema.parse({ requestRole, responseRole });
      const isAuth = await authHelper();
      if (
        !isAuth.success ||
        (isAuth.user?.role !== "ADMIN" && isAuth.user?.role !== "DISPATCHER")
      ) {
        return {
          success: false,
          message: isAuth.message,
          status: isAuth.status,
        };
      }
      const res = await Dispatcher.getUsers(
        validData.requestRole,
        validData.responseRole,
      );
      return {
        success: res.success,
        message: res.message,
        status: res.status,
        users: res.users,
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
