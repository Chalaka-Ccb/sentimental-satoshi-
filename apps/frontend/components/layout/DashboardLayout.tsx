'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, User } from 'lucide-react';

type SearchOption = {
  symbol: string;
  name: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchOptions?: SearchOption[];
};

export default function DashboardLayout({
  children,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchOptions = [],
}: DashboardLayoutProps) {
  const searchId = 'dashboard-symbol-search';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-slate-950/50 backdrop-blur-md z-10">
          <form
            className="flex items-center gap-4 bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-full w-full max-w-[28rem]"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit?.(searchValue?.trim() || '');
            }}
          >
            <Search size={18} className="text-slate-500" />
            <input
              id={searchId}
              name="symbol"
              type="text"
              list={`${searchId}-options`}
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search pairs or assets..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-500"
            />
            <datalist id={`${searchId}-options`}>
              {searchOptions.map((option) => (
                <option key={option.symbol} value={option.symbol} label={option.name} />
              ))}
            </datalist>
          </form>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="text-slate-400 hover:text-slate-200 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full border-2 border-slate-950" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-slate-800">
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