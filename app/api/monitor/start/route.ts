import { NextResponse } from "next/server";
import { StockMonitor } from "@/lib/stockMonitor";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const intervalMinutes = body.intervalMinutes || 5;

    const monitor = StockMonitor.getInstance();
    monitor.start(intervalMinutes);

    return NextResponse.json({ 
      success: true, 
      message: `Stock monitor started with ${intervalMinutes} minute intervals` 
    });
  } catch (error) {
    console.error('Failed to start stock monitor:', error);
    return NextResponse.json(
      { error: "Failed to start stock monitor" },
      { status: 500 }
    );
  }
}