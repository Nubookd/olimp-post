import { OrderStatus, UserRole } from "@/types";
import { ORDER_STATUS_RULES } from "./role";

export const canChangeToStatus = (
  role: UserRole,
  newStatus: OrderStatus,
): boolean => {
  return ORDER_STATUS_RULES[role]?.includes(newStatus) || false;
};

export const canChangeOrderStatus = (
  role: UserRole,
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean => {
  if (!canChangeToStatus(role, newStatus)) {
    return false;
  }
  const statusTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDING: ["AGREED", "CANCELLED"],
    AGREED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };
  const allowedTransitions = statusTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};
