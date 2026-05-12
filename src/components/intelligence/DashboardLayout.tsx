'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Cloud, 
  Snowflake, 
  MapPin, 
  Hotel, 
  TrendingUp,
  Menu,
  X,
  Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: BarChart3, label: 'Tourism Stats', href: '#stats', id: 'stats' },
    { icon: Cloud, label: 'Weather', href: '#weather', id: 'weather' },
    { icon: Snowflake, label: 'Snowfall', href: '#snowfall', id: 'snowfall' },
    { icon: MapPin, label: 'Traffic', href: '#traffic', id: 'traffic' },
    { icon: Hotel, label: 'Occupancy', href: '#occupancy', id: 'occupancy' },
    { icon: TrendingUp, label: 'Price Trends', href: '#prices', id: 'prices' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Home className="w-5 h-5" />
            <span className="font-semibold">Intelligence Portal</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900/90 backdrop-blur-xl border-r border-gray-700 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
            <Home className="w-5 h-5" />
            <span className="font-bold text-xl">Intelligence Portal</span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all group"
              >
                <Icon className="w-5 h-5 group-hover:text-blue-400 transition" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

