'use client';

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Sun } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  snowProbability: number;
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
    snowProb: number;
  }>;
}

export default function WeatherForecast() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      console.log('Fetching weather data...');
      const response = await fetch('/api/weather');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API response error:', response.status, errorText);
        throw new Error(`Failed to fetch weather: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Weather data received:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setWeather(data);
      } else {
        console.warn('Weather data is empty or invalid');
        throw new Error('Invalid weather data received');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback data
      setWeather([
        {
          location: 'Srinagar',
          temperature: 8,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          snowProbability: 20,
          forecast: [],
        },
        {
          location: 'Gulmarg',
          temperature: 5,
          condition: 'Cloudy',
          humidity: 70,
          windSpeed: 15,
          snowProbability: 40,
          forecast: [],
        },
        {
          location: 'Pahalgam',
          temperature: 7,
          condition: 'Partly Cloudy',
          humidity: 68,
          windSpeed: 10,
          snowProbability: 25,
          forecast: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="weather" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="weather" className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Cloud className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Live Weather</h2>
          <p className="text-sm text-gray-400">5-day forecast</p>
        </div>
      </div>

      <div className="space-y-4">
        {weather.map((loc) => (
          <div key={loc.location} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{loc.location}</h3>
              <span className="text-3xl font-bold text-cyan-400">{loc.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">{loc.condition}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">{loc.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{loc.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-white" />
                <span className="text-gray-400">Snow: {loc.snowProbability}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

