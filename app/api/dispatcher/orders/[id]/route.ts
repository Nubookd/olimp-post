import DispatcherOrders from "@/lib/orders/DispatcherOrders";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { IdSchema } from "@/lib/validators/common.validator";
import { ApprovalOrderSchema } from "@/lib/validators/orders.validator";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const validId = IdSchema.parse(Number(id));
    const res = await DispatcherOrders.getDetailsOrder(validId);
    return NextResponse.json(res, {
      status: res.status,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);
      return NextResponse.json(formattedError, { status: 500 });
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = ApprovalOrderSchema.parse(body.data);

    const res = await DispatcherOrders.approvalOrder(
      validData.orderId,
      validData.dispatcherId,
      validData.courierId,
      validData.role,
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
