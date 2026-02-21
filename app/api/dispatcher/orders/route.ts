import DispatcherOrders from "@/lib/orders/DispatcherOrders";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { GetOrdersSchema } from "@/lib/validators/orders.validator";
import { OrderStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status") as OrderStatus;
    const page = parseInt(searchParams.get("page") || "1");

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Не указан статус для поиска",
        },
        {
          status: 400,
        },
      );
    }
    const validData = GetOrdersSchema.parse({
      status,
      filters: { page },
    });
    const res = await DispatcherOrders.getOrders(
      validData.role,
      validData.status,
      validData.filters,
    );
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
