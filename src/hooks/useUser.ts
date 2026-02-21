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


  const getOrders = useCallback(
    async (status: OrderStatus, page?: number): Promise<IClientResponse> => {
      try {
        setLoading((prev) => ({ ...prev, orders: true }));
        setError((prev) => ({ ...prev, orders: "" }));
        const isAuth = await checkAuth();
        if (!isAuth.success || !isAuth.user) {
          return {
            success: false,
            message: isAuth.message,
            status: 401,
          };
        }
        const validRole = UserRoleSchema.safeParse(isAuth.user.role);
        if (!validRole.success) {
          return formatZodError(validRole.error);
        }
        const validStatus = OrderStatusSchema.safeParse(status);
        if (!validStatus.success) {
          return formatZodError(validStatus.error);
        }

        const validPagination = PaginationSchema.safeParse({
          status,
          page,
        });
        if (!validPagination.success) {
          return formatZodError(validPagination.error);
        }
        const params = new URLSearchParams();
        params.set("role", validRole.data);
        if (validPagination.data.status) {
          params.set("status", validPagination.data.status);
        }
        if (validPagination.data.page) {
          params.set("page", validPagination.data.page.toString());
        }
        const res = await fetch(`/api/dashboard/orders?${params.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          let errorMessage = `Ошибка HTTP: ${res.status}`;

          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;

          setError((prev) => ({ ...prev, orders: errorMessage }));
          return {
            success: false,
            message: errorMessage,
            status: res.status,
          };
        }
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
          return {
            success: data.success,
            message: data.message,
            status: data.status,
            orders: data.orders,
            meta: data.meta,
          };
        } else {
          setError((prev) => ({
            ...prev,
            orders: data.message || "Ошибка загрузки",
          }));
          return {
            success: false,
            message: data.message || "Ошибка загрузки заказов",
            status: data.status || 400,
          };
        }
      } catch (error) {
        return {
          success: false,
          message: "Внутренняя ошибка сервера | hook",
          status: 500,
        };
      } finally {
        setLoading((prev) => ({ ...prev, orders: false }));
      }
    },
    [checkAuth],
  );

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

  const getDetailsOrder = useCallback(
    async (orderId: number): Promise<IClientResponse> => {
      try {
        setLoading((prev) => ({ ...prev, details: true }));
        const isValidData = IdSchema.safeParse(orderId);
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
        const res = await fetch(`/api/dashboard/orders/${orderId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        return {
          success: data.success,
          message: data.message,
          status: data.status,
          order: data.order,
        };
      } catch (error) {
        return {
          success: false,
          message: "Внутренняя ошибка сервера | hook",
          status: 500,
        };
      } finally {
        setLoading((prev) => ({ ...prev, details: false }));
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
