'use client';

import { useEffect, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import all Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface TrafficData {
  location: string;
  congestion: 'low' | 'medium' | 'high';
  status: string;
}

export default function TrafficAlerts() {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTraffic();
    
    // Fix Leaflet icon for Next.js (only on client side)
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      });
    }
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchTraffic, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTraffic = async () => {
    try {
      const response = await fetch('/api/traffic');
      if (!response.ok) throw new Error('Failed to fetch traffic data');
      const data = await response.json();
      setTraffic(data);
    } catch (error) {
      console.error('Error fetching traffic:', error);
      setTraffic({
        location: 'Srinagar',
        congestion: 'medium',
        status: 'Moderate traffic',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCongestionColor = (congestion: string) => {
    const colors = {
      low: 'text-green-400 bg-green-500/20 border-green-500/50',
      medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
      high: 'text-red-400 bg-red-500/20 border-red-500/50',
    };
    return colors[congestion as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div id="traffic" className="glass-card p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="traffic" className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <MapPin className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Traffic Alerts</h2>
          <p className="text-sm text-gray-400">Live Srinagar traffic</p>
        </div>
      </div>

      {traffic && (
        <div className="mb-4 bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-white">{traffic.location}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCongestionColor(traffic.congestion)}`}>
              {traffic.congestion.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-400">{traffic.status}</p>
        </div>
      )}

      {mounted && (
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-800">
          <MapContainer
            center={[34.0837, 74.7973]}
            zoom={12}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="dark-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[34.0837, 74.7973]}>
              <Popup>
                <div className="text-center">
                  <strong className="text-white">Srinagar</strong>
                  <p className="text-sm text-gray-300 mt-1">{traffic?.status || 'Traffic monitoring'}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center">
        OpenStreetMap - Srinagar location
      </p>
    </div>
  );
}

