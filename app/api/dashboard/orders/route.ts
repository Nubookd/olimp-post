import CustomerOrders from "@/lib/orders/CustomerOrders";
import UserOrders from "@/lib/orders/UserOrders";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import {
  OrderStatusSchema,
  UserRoleSchema,
} from "@/lib/validators/common.validator";
import { ChequeSchema } from "@/lib/validators/orders.validator";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderData = body.order || body;
    const validData = ChequeSchema.parse(orderData);
    const res = await CustomerOrders.createOrder(validData);
    return NextResponse.json(res, {
      status: res.status,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);
      return NextResponse.json(formattedError, { status: 400 });
    }
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const validStatus = OrderStatusSchema.parse(status);
    const validRole = UserRoleSchema.parse(role);

    const filters: { page?: number } = {};
    if (page) {
      filters.page = Number(page);
    }
    const res = await UserOrders.getOrders(validRole, validStatus, filters);
    return NextResponse.json(res, {
      status: res.status,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);
      return NextResponse.json(formattedError, { status: 400 });
    }
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 500 },
    );
  }
}
