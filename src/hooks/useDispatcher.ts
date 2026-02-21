import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { OrderStatus, UserRole } from "@/types";
import {
  ApprovalOrderSchema,
  GetUsersSchema,
} from "@/lib/validators/orders.validator";
import { formatZodError } from "@/lib/utils/zod-error-formatter";

export function useDispatcher() {
  const { checkAuth } = useAuth();

  const approvalOrder = useCallback(
    async (
      orderId: number,
      courierId: number,
      dispatcherId: number,
      currentStatus: OrderStatus,
    ) => {
      try {
        const isAuth = await checkAuth();
        if (!isAuth.success || !isAuth.user) {
          return {
            success: false,
            message: isAuth.message,
            status: 401,
          };
        }
        const isValidData = ApprovalOrderSchema.safeParse({
          orderId,
          courierId,
          dispatcherId,
          role: isAuth.user.role,
          currentStatus,
        });
        if (!isValidData.success) {
          return formatZodError(isValidData.error);
        }
        const res = await fetch(`/api/dispatcher/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isValidData),
        });
        const data = await res.json();
        return {
          success: data.success,
          message: data.message,
          status: data.status,
        };
      } catch (error) {
        return {
          success: false,
          message: "Внутренняя ошибка сервера | hook",
          status: 500,
        };
      }
    },
    [checkAuth],
  );

  const getUsers = useCallback(
    async (requestRole: UserRole, responseRole: UserRole) => {
      try {
        const isAuth = await checkAuth();
        if (
          !isAuth.success ||
          !isAuth.user ||
          (isAuth.user.role !== "ADMIN" && isAuth.user.role !== "DISPATCHER")
        ) {
          return {
            success: false,
            message: isAuth.message,
            status: 401,
          };
        }

        const isValidData = GetUsersSchema.safeParse({
          requestRole,
          responseRole,
        });
        if (!isValidData.success) {
          const formattedError = formatZodError(isValidData.error);
          return { ...formattedError, users: [] };
        }
        const res = await fetch(
          `/api/dispatcher/users?requestRole=${isValidData.data.requestRole}&responseRole=${isValidData.data.responseRole}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await res.json();
        return {
          success: data.success,
          message: data.message,
          status: data.status,
          users: data.users,
        };
      } catch (error) {
        return {
          success: false,
          message: "Внутренняя ошибка сервера | hook",
          status: 500,
        };
      }
    },
    [checkAuth],
  );

  return {
    approvalOrder,
    getUsers,
  };
}
