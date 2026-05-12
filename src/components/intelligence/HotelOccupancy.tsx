'use client';

import { useEffect, useState } from 'react';
import { Hotel, TrendingUp } from 'lucide-react';
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

interface OccupancyData {
  year: number;
  month: number;
  occupancy_percentage: number;
  peak_season: boolean;
}

export default function HotelOccupancy() {
  const [occupancy, setOccupancy] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupancy();
  }, []);

  const fetchOccupancy = async () => {
    try {
      const firebaseClient = createClient();
      const { data, error } = await firebaseClient
        .from('hotel_occupancy')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(12);

      if (error) throw error;
      setOccupancy(data || []);
    } catch (error) {
      console.error('Error fetching occupancy:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentAvg = occupancy.length > 0
    ? occupancy.slice(0, 3).reduce((sum, o) => sum + o.occupancy_percentage, 0) / Math.min(3, occupancy.length)
    : 0;

  const isPeakSeason = occupancy.length > 0 && occupancy[0]?.peak_season;

  const chartData = {
    labels: occupancy.slice().reverse().map(o => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[o.month - 1]} ${o.year}`;
    }),
    datasets: [
      {
        label: 'Occupancy %',
        data: occupancy.slice().reverse().map(o => o.occupancy_percentage),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
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
        min: 0,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div id="occupancy" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="occupancy" className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Hotel className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Hotel Occupancy</h2>
            <p className="text-sm text-gray-400">Monthly trends</p>
          </div>
        </div>
        {isPeakSeason && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-medium">
            Peak Season
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Avg Occupancy</span>
          </div>
          <p className="text-3xl font-bold text-white">{currentAvg.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hotel className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Status</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {currentAvg > 70 ? 'High' : currentAvg > 40 ? 'Moderate' : 'Low'}
          </p>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

