import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/prisma";

export async function GET() {
  const catalog = await prisma.product.findMany();
  return NextResponse.json(catalog);
}
