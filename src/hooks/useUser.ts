"use client";
import { ICheque, IClientResponse, IOrder, OrderStatus } from "@/types";
import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import {
  IdSchema,
  OrderStatusSchema,
  UserRoleSchema,
} from "@/lib/validators/common.validator";
import {
  ChangeOrderStatusSchema,
  ChequeSchema,
  PaginationSchema,
} from "@/lib/validators/orders.validator";

export function useUser() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState({
    orders: false,
    create: false,
    details: false,
    status: false,
  });
  const [error, setError] = useState({
    orders: "",
    create: "",
    details: "",
    status: "",
  });
  const { checkAuth } = useAuth();


  const createOrder = useCallback(
    async (order: ICheque): Promise<IClientResponse> => {
      try {
        setLoading((prev) => ({ ...prev, create: true }));
        const isValidData = ChequeSchema.safeParse(order);
        if (!isValidData.success) {
          const formattedError = formatZodError(isValidData.error);
          return formattedError;
        }
        const isAuth = await checkAuth();
        if (!isAuth.success) {
          return {
            success: false,
            message: isAuth.message,
            status: 401,
          };
        }
        const res = await fetch("/api/dashboard/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: order }),
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
      } finally {
        setLoading((prev) => ({ ...prev, create: false }));
      }
    },
    [checkAuth],
  );

  

  return {
    loading,
    error,
    orders,
    getOrders,
    createOrder,
    getDetailsOrder,
    changeOrderStatus,
  };
}
