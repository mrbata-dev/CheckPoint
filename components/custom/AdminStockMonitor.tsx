'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const AdminStockMonitor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/monitor/status');
      const data = await response.json();
      setIsRunning(data.isRunning);
    } catch (error) {
      console.error('Error checking monitor status:', error);
    }
  };

  const startMonitor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitor/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intervalMinutes: 5 })
      });
      
      if (response.ok) {
        setIsRunning(true);
        alert('Stock monitor started successfully');
      }
    } catch (error) {
      console.error('Error starting monitor:', error);
      alert('Failed to start stock monitor');
    } finally {
      setLoading(false);
    }
  };

  const stopMonitor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitor/stop', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsRunning(false);
        alert('Stock monitor stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping monitor:', error);
      alert('Failed to stop stock monitor');
    } finally {
      setLoading(false);
    }
  };

  const manualCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stock-check', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Manual stock check completed');
      }
    } catch (error) {
      console.error('Error during manual check:', error);
      alert('Manual stock check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Stock Monitor Control</h3>
      <div className="flex items-center gap-4 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={isRunning ? stopMonitor : startMonitor}
          disabled={loading}
          variant={isRunning ? 'destructive' : 'default'}
        >
          {loading ? 'Loading...' : (isRunning ? 'Stop Monitor' : 'Start Monitor')}
        </Button>
        <Button 
          onClick={manualCheck}
          disabled={loading}
          variant="outline"
        >
          Manual Check
        </Button>
        <Button 
          onClick={checkStatus}
          disabled={loading}
          variant="outline"
        >
          Refresh Status
        </Button>
      </div>
    </div>
  );
};