import UserOrders from "@/lib/orders/UserOrders";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { IdSchema } from "@/lib/validators/common.validator";
import { ChangeOrderStatusSchema } from "@/lib/validators/orders.validator";
import { OrderStatus, UserRole } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const validId = IdSchema.parse(Number(id));
    const res = await UserOrders.getDetailsOrder(validId);
    return NextResponse.json(res, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = ChangeOrderStatusSchema.parse(body.data);
    const res = await UserOrders.changeOrderStatus(
      validData.orderId,
      validData.role,
      validData.newStatus,
      validData.currentStatus,
    );
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
