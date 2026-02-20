import Auth from "@/lib/auth/authManager";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await Auth.findMe();
    return NextResponse.json(res, {
      status: res.status
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 500 },
    );
  }
}
