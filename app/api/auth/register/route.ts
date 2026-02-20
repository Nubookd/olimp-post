import Auth from "@/lib/auth/authManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();
    const user = await Auth.login({ login, password });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 401 },
    );
  }
}
