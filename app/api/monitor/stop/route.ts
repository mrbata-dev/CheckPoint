import { StockMonitor } from "@/lib/stockMonitor";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const monitor = StockMonitor.getInstance();
    monitor.stop();

    return NextResponse.json({ 
      success: true, 
      message: "Stock monitor stopped" 
    });
  } catch (error) {
    console.error('Failed to stop stock monitor:', error);
    return NextResponse.json(
      { error: "Failed to stop stock monitor" },
      { status: 500 }
    );
  }
}
