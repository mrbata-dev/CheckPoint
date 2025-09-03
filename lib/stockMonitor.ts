import { checkAllProductsForLowStock } from './prisma';

export class StockMonitor {
  private static instance: StockMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): StockMonitor {
    if (!StockMonitor.instance) {
      StockMonitor.instance = new StockMonitor();
    }
    return StockMonitor.instance;
  }

  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('Stock monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting stock monitor with ${intervalMinutes} minute intervals`);

    // Run immediately
    this.checkStock();

    // Set up periodic checking
    this.intervalId = setInterval(() => {
      this.checkStock();
    }, intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Stock monitor stopped');
  }

  private async checkStock(): Promise<void> {
    try {
      console.log('Running periodic stock check...');
      await checkAllProductsForLowStock();
      console.log('Stock check completed');
    } catch (error) {
      console.error('Error during periodic stock check:', error);
    }
  }

  isMonitorRunning(): boolean {
    return this.isRunning;
  }
}