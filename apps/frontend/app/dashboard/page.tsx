'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TradingViewChart from '@/components/dashboard/TradingViewChart';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { TrendingUp, Activity, MessageSquare, Newspaper, ArrowUpRight, X, Globe } from 'lucide-react';

export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [socialFeed, setSocialFeed] = useState<any[]>([]);
  const [symbol, setSymbol] = useState('BTC');
  const accessToken = useAuthStore((state) => state.accessToken);
  const latestMarketPrice = Number(chartData.at(-1)?.close);
  const previousMarketPrice = Number(chartData.at(-2)?.close);
  const marketPriceChangePercent =
    Number.isFinite(latestMarketPrice) && Number.isFinite(previousMarketPrice) && previousMarketPrice !== 0
      ? `${latestMarketPrice >= previousMarketPrice ? '+' : ''}${(((latestMarketPrice - previousMarketPrice) / previousMarketPrice) * 100).toFixed(1)}%`
      : '—';
  const formattedMarketPrice = Number.isFinite(latestMarketPrice)
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(latestMarketPrice)
    : '—';

  // 1. Fetch Chart Data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/prices/${symbol}/ohlcv`);
        // FIX: The backend already returns objects {time, open, high, low, close}
        // We just need to pass response.data.data directly
        if (response.data && response.data.data) {
          setChartData(response.data.data);
        }
      } catch (err) {
        console.error('Chart API Error:', err);
      }
    };
    fetchHistory();
  }, [symbol]);

  // 2. Fetch Social & News Data
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchSocial = async () => {
      try {
        // Fetching from your active backend routes
        const [newsRes, socialRes] = await Promise.all([
          api.get(`/news/${symbol}`),
          api.get(`/social/${symbol}`)
        ]);

        // Combine and sort by time (mock sorting if timestamps differ)
        const combined = [
          ...(newsRes.data || []).map((i: any) => ({ ...i, type: 'news' })),
          ...(socialRes.data || []).map((i: any) => ({ ...i, type: 'social' }))
        ];
        setSocialFeed(combined.slice(0, 10)); // Top 10 items
      } catch (err) {
        if ((err as any)?.response?.status !== 401) {
          console.error('Social API Error:', err);
        }
      }
    };
    fetchSocial();
  }, [symbol, accessToken]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">Market Overview</h1>
            <p className="text-slate-400">Tracking Sentiment and US Senator Trade Alpha.</p>
          </div>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-cyan-400 outline-none"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Market Price" value={formattedMarketPrice} change={marketPriceChangePercent} icon={TrendingUp} color="cyan" />
          <StatCard title="AI Conviction" value="84% Bullish" change="+5.2%" icon={Activity} color="green" />
          <StatCard title="Social Buzz" value="Twitter" change="Active" icon={MessageSquare} color="blue" />
          <StatCard title="Sentiment" value="High Greed" change="Stable" icon={Newspaper} color="slate" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CHART AREA */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 min-h-[500px]">
            <h3 className="font-bold text-lg mb-6 text-slate-100 uppercase tracking-widest text-xs">Price Analytics</h3>
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden h-[400px]">
              <TradingViewChart data={chartData} />
            </div>
          </div>

          {/* SOCIAL FEED AREA */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <h3 className="font-bold text-lg mb-6 text-slate-100 uppercase tracking-widest text-xs">Senator & Social Alpha</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {socialFeed.length > 0 ? (
                socialFeed.map((item: any, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] flex items-center gap-1 font-bold ${item.type === 'news' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {item.type === 'news' ? <Globe size={10}/> : <X size={10}/>} {item.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-3">{item.title || item.text}</p>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                  Scanning social signals...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (Whale & Senator Placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 min-h-[300px]">
            <h3 className="font-bold text-lg mb-4 text-slate-100">Whale Movement Log</h3>
            <div className="h-48 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 text-sm">
              Monitoring large wallet transactions...
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 min-h-[300px]">
            <h3 className="font-bold text-lg mb-4 text-slate-100">Senator Disclosures</h3>
            <div className="h-48 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 text-sm">
              Awaiting US Senator trade disclosures...
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Sub-component for stats
function StatCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl transition-hover hover:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        <span className="text-green-400 text-xs flex items-center mb-1">
          <ArrowUpRight size={12} className="mr-1"/> {change}
        </span>
      </div>
    </div>
  );
}