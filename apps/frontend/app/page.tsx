import React from 'react';
import Link from 'next/link';
import { ShieldAlert, TrendingUp, Activity, Lock, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {/* 1. Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Sentimental Satoshi
        </div>
        <div className="space-x-4">
          <Link href="/auth/login" className="px-4 py-2 hover:text-cyan-400 transition">Login</Link>
          <Link href="/auth/register" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="px-8 pt-20 pb-32 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Trade on <span className="text-cyan-400">Sentiment</span>, <br /> Not Just Price.
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          We use AI to scan thousands of social signals and news headlines to give you a 
          conviction score before the market moves.
        </p>
        
        {/* Quick Price Ticker (Mocked for now) */}
        <div className="flex flex-wrap justify-center gap-4">
          {['BTC', 'ETH', 'SOL'].map((coin) => (
            <div key={coin} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3 w-40">
              <span className="font-bold">{coin}</span>
              <span className="text-green-400 text-sm flex items-center"><ArrowUpRight size={14}/> 2.4%</span>
            </div>
          ))}
        </div>
      </header>

      {/* 3. The Teaser Grid (Whale & Sensor Tracking) */}
      <section className="px-8 pb-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Whale Tracker Teaser */}
          <div className="group relative overflow-hidden bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><TrendingUp size={32}/></div>
              <h3 className="text-2xl font-bold">Whale Movements</h3>
            </div>
            <p className="text-slate-400 mb-6">Monitor large wallet inflows and outflows in real-time to anticipate market dumps.</p>
            
            {/* Locked UI Overlay */}
            <div className="relative h-32 bg-slate-950/50 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
              <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl" />
              <div className="z-10 flex flex-col items-center text-slate-500">
                <Lock size={20} className="mb-2"/>
                <span className="text-xs uppercase tracking-widest">Sign in to view movements</span>
              </div>
            </div>
          </div>

          {/* Sensor Tracking Teaser */}
          <div className="group relative overflow-hidden bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><Activity size={32}/></div>
              <h3 className="text-2xl font-bold">Sensor Analytics</h3>
            </div>
            <p className="text-slate-400 mb-6">Real-time network health and node latency tracking for decentralized stability.</p>
            
            {/* Locked UI Overlay */}
            <div className="relative h-32 bg-slate-950/50 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
              <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl" />
              <div className="z-10 flex flex-col items-center text-slate-500">
                <Lock size={20} className="mb-2"/>
                <span className="text-xs uppercase tracking-widest">Available for Pro Members</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}