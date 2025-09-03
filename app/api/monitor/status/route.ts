import { StockMonitor } from "@/lib/stockMonitor";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const monitor = StockMonitor.getInstance();
    const isRunning = monitor.isMonitorRunning();

    return NextResponse.json({ 
      isRunning,
      status: isRunning ? 'running' : 'stopped'
    });
  } catch (error) {
    console.error('Failed to get monitor status:', error);
    return NextResponse.json(
      { error: "Failed to get monitor status" },
      { status: 500 }
    );
  }
}