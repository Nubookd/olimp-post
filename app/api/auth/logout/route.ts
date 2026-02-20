import Auth from "@/lib/auth/authManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const res = await Auth.logout();
    return NextResponse.json(res, {
      status: res.status || 200,
    });
  } catch (error) {
    console.error("Ошибка выхода:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера | api",
      },
      { status: 500 },
    );
  }
}
