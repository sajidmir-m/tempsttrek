import { Metadata } from 'next';
import DashboardLayout from '@/components/intelligence/DashboardLayout';
import TourismStats from '@/components/intelligence/TourismStats';
import WeatherForecast from '@/components/intelligence/WeatherForecast';
import SnowfallTracker from '@/components/intelligence/SnowfallTracker';
import TrafficAlerts from '@/components/intelligence/TrafficAlerts';
import HotelOccupancy from '@/components/intelligence/HotelOccupancy';
import PriceTrends from '@/components/intelligence/PriceTrends';

export const metadata: Metadata = {
  title: 'Kashmir Tourism Intelligence Portal – Real Time Data & Insights',
  description: 'Comprehensive analytics and intelligence dashboard for Kashmir tourism data, weather forecasts, traffic alerts, and market trends.',
};

export default function IntelligencePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Kashmir Tourism Intelligence Portal
          </h1>
          <p className="text-gray-400 text-lg">Real Time Data & Insights</p>
        </div>

        {/* Tourism Stats - Full Width */}
        <div id="stats-section">
          <TourismStats />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div id="weather-section">
            <WeatherForecast />
          </div>
          <div id="snowfall-section">
            <SnowfallTracker />
          </div>
          <div id="traffic-section">
            <TrafficAlerts />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="occupancy-section">
            <HotelOccupancy />
          </div>
          <div id="prices-section">
            <PriceTrends />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

