'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-full w-96">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search pairs or assets..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-200 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full border-2 border-slate-950" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium">Chalaka</p>
                <p className="text-xs text-slate-500">Pro Trader</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-slate-800">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}