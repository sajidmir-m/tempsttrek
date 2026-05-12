'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceData {
  year: number;
  month: number;
  avg_price: number;
  bookings_count: number;
}

export default function PriceTrends() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const firebaseClient = createClient();
      const { data, error } = await firebaseClient
        .from('price_trends')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(12);

      if (error) throw error;
      setPrices(data || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = prices[0]?.avg_price || 0;
  const lastMonthPrice = prices[1]?.avg_price || 0;
  const priceChange = lastMonthPrice > 0
    ? ((currentPrice - lastMonthPrice) / lastMonthPrice) * 100
    : 0;

  const chartData = {
    labels: prices.slice().reverse().map(p => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[p.month - 1]} ${p.year}`;
    }),
    datasets: [
      {
        label: 'Avg Price (₹)',
        data: prices.slice().reverse().map(p => p.avg_price),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
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
        callbacks: {
          label: (context: any) => `₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { 
          color: '#9ca3af',
          callback: (value: any) => `₹${value.toLocaleString()}`,
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  if (loading) {
    return (
      <div id="prices" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="prices" className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Price Trend Analysis</h2>
          <p className="text-sm text-gray-400">Package pricing trends</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Current Avg</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{currentPrice.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Last Month</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{lastMonthPrice.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-400" />
            )}
            <span className="text-xs text-gray-400">Change</span>
          </div>
          <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

