'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TradingViewChart from '@/components/dashboard/TradingViewChart';
import api from '@/lib/api';

export default function DashboardPage() {
  const [chartData, setChartData] = useState([]);
  const [symbol, setSymbol] = useState('BTC');

  // Fetch initial OHLCV data from your backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/prices/ohlcv/${symbol}`);
        // Map backend data to format required by lightweight-charts
        const formatted = response.data.map((d: any) => ({
          time: d.timestamp / 1000, // Unix timestamp
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
        setChartData(formatted);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      }
    };
    fetchHistory();
  }, [symbol]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
            <p className="text-slate-400">Real-time sentiment and price monitoring.</p>
          </div>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-cyan-400 focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer outline-none"
          >
            <option value="BTC">Bitcoin / USDT</option>
            <option value="ETH">Ethereum / USDT</option>
            <option value="SOL">Solana / USDT</option>
          </select>
        </div>

        {/* ... StatCards stay the same ... */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Price Analytics</h3>
              <span className="text-xs text-slate-500 uppercase font-mono tracking-widest">Live Feed Enabled</span>
            </div>
            
            {/* REAL CHART INTEGRATION */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden p-2">
              <TradingViewChart data={chartData} />
            </div>
          </div>

          {/* ... Social Feed stays the same ... */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 min-h-[300px]">
            <h3 className="font-bold text-lg mb-4">Whale Movement Tracking</h3>
            {/* Placeholder until Whale microservice is live */}
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 min-h-[300px]">
            <h3 className="font-bold text-lg mb-4">Sensor Tracking</h3>
            {/* Placeholder until Sensor microservice is live */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}