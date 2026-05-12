'use client';

import { useEffect, useState } from 'react';
import { Snowflake, Calendar } from 'lucide-react';

interface SnowfallData {
  location: string;
  status: 'heavy' | 'light' | 'none';
  lastSnowfallDate: string | null;
  snowDepth: number | null;
}

export default function SnowfallTracker() {
  const [snowfall, setSnowfall] = useState<SnowfallData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnowfall();
    // Refresh every hour
    const interval = setInterval(fetchSnowfall, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSnowfall = async () => {
    try {
      const response = await fetch('/api/snowfall');
      if (!response.ok) throw new Error('Failed to fetch snowfall data');
      const data = await response.json();
      setSnowfall(data);
    } catch (error) {
      console.error('Error fetching snowfall:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      heavy: { emoji: '❄️', text: 'Heavy Snow', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
      light: { emoji: '🌨️', text: 'Light Snow', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' },
      none: { emoji: '☀️', text: 'No Snow', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    };
    return badges[status as keyof typeof badges] || badges.none;
  };

  if (loading) {
    return (
      <div id="snowfall" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="snowfall" className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Snowflake className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Snowfall Tracker</h2>
          <p className="text-sm text-gray-400">Real-time snow status</p>
        </div>
      </div>

      <div className="space-y-4">
        {snowfall.map((loc) => {
          const badge = getStatusBadge(loc.status);
          return (
            <div key={loc.location} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{loc.location}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                  {badge.emoji} {badge.text}
                </span>
              </div>
              {loc.lastSnowfallDate && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last snowfall: {new Date(loc.lastSnowfallDate).toLocaleDateString()}</span>
                </div>
              )}
              {loc.snowDepth !== null && (
                <div className="text-sm text-gray-300">
                  Snow depth: <span className="font-semibold text-white">{loc.snowDepth} cm</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

