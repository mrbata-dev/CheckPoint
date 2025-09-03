import { NextResponse } from "next/server";
import { checkAllProductsForLowStock } from "@/lib/prisma";

export async function POST() {
  try {
    await checkAllProductsForLowStock();
    return NextResponse.json({ success: true, message: "Stock check completed" });
  } catch (error) {
    console.error('Stock check failed:', error);
    return NextResponse.json(
      { error: "Stock check failed" },
      { status: 500 }
    );
  }
}