import Auth from "@/lib/auth/authManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const res = await Auth.checkAuth();
    return NextResponse.json(res, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Внутренняя ошибка сервера | api",
      status: 500,
    });
  }
}
