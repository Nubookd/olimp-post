import { IClientResponse, OrderStatus, UserRole } from "@/types";
import Auth from "../auth/authManager";
import { canChangeOrderStatus } from "../auth/permissions/permissions";

export async function authHelper(
  currentStatus?: OrderStatus,
  newStatus?: OrderStatus,
): Promise<IClientResponse> {
  const auth = await Auth.checkAuth();
  if (!auth.success) {
    return {
      success: false,
      message: auth.message || "Требуется аутентификация",
      status: 401,
    };
  }
  if (auth.user?.role && currentStatus && newStatus) {
    const isCanChange = canChangeOrderStatus(
      auth.user?.role as UserRole,
      currentStatus,
      newStatus,
    );
    if (!isCanChange) {
      return {
        success: false,
        message: "Недостаточно прав для изменения статуса",
        status: 403,
      };
    }

    return {
      success: true,
      message: "Смена статуса разрешена",
      status: 200,
      user: auth.user,
    };
  }
  return {
    success: true,
    message: "Авторизация успешна",
    status: 200,
    user: auth.user,
  };
}
