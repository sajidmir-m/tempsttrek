'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Globe, TrendingUp } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { createClient } from '@/lib/firebase-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TourismStat {
  year: number;
  month: number;
  domestic_visitors: number;
  international_visitors: number;
  total_visitors: number;
}

export default function TourismStats() {
  const [stats, setStats] = useState<TourismStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const firebaseClient = createClient();
      const { data, error } = await firebaseClient
        .from('tourism_stats')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(24);

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching tourism stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const last12Months = stats.filter(s => s.year === currentYear || (s.year === currentYear - 1 && s.month > new Date().getMonth()));
  const yearlyData = stats.reduce((acc, stat) => {
    if (!acc[stat.year]) {
      acc[stat.year] = { domestic: 0, international: 0, total: 0 };
    }
    acc[stat.year].domestic += stat.domestic_visitors;
    acc[stat.year].international += stat.international_visitors;
    acc[stat.year].total += stat.total_visitors;
    return acc;
  }, {} as Record<number, { domestic: number; international: number; total: number }>);

  const totalVisitors = stats.reduce((sum, s) => sum + s.total_visitors, 0);
  const totalDomestic = stats.reduce((sum, s) => sum + s.domestic_visitors, 0);
  const totalInternational = stats.reduce((sum, s) => sum + s.international_visitors, 0);

  const monthlyChartData = {
    labels: last12Months.slice(-12).map(s => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[s.month - 1]} ${s.year}`;
    }).reverse(),
    datasets: [
      {
        label: 'Domestic',
        data: last12Months.slice(-12).map(s => s.domestic_visitors).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'International',
        data: last12Months.slice(-12).map(s => s.international_visitors).reverse(),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const yearlyChartData = {
    labels: Object.keys(yearlyData).sort().slice(-5),
    datasets: [
      {
        label: 'Total Visitors',
        data: Object.keys(yearlyData).sort().slice(-5).map(y => yearlyData[parseInt(y)].total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e5e7eb' },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  if (loading) {
    return (
      <div id="stats" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="stats" className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tourism Statistics</h2>
            <p className="text-sm text-gray-400">Visitor trends & analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('monthly')}
            className={`px-3 py-1 rounded text-sm transition ${
              selectedView === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedView('yearly')}
            className={`px-3 py-1 rounded text-sm transition ${
              selectedView === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            <AnimatedCounter value={totalVisitors} />
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Domestic</span>
          </div>
          <p className="text-2xl font-bold text-white">
            <AnimatedCounter value={totalDomestic} />
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">International</span>
          </div>
          <p className="text-2xl font-bold text-white">
            <AnimatedCounter value={totalInternational} />
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="h-64">
        {selectedView === 'monthly' ? (
          <Line data={monthlyChartData} options={chartOptions} />
        ) : (
          <Bar data={yearlyChartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

