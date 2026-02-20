import Auth from "@/lib/auth/authManager";
import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { LoginUserSchema } from "@/lib/validators/auth.validator";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validData = LoginUserSchema.parse(body);
    const res = await Auth.login(validData);
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
