import DispatcherOrders from "@/lib/orders/DispatcherOrders";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { GetUsersSchema } from "@/lib/validators/orders.validator";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestRole = searchParams.get("requestRole");
    const responseRole = searchParams.get("responseRole");

    const validData = GetUsersSchema.parse({ requestRole, responseRole });

    const res = await DispatcherOrders.getUsers(
      validData.requestRole,
      validData.responseRole,
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
