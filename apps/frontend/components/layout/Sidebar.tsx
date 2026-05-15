'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Fish,
  Activity, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Whale Tracker', href: '/dashboard/whale-tracker', icon: Fish },
  { name: 'Senetor Tracking', href: '/dashboard/sensor-tracking', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-cyan-500/20 p-2 rounded-lg">
          <TrendingUp className="text-cyan-400 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-50">Satoshi AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-cyan-400' : 'group-hover:text-slate-200'} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/5 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}