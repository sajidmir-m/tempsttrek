'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';
import { Plus, Save, X } from 'lucide-react';

export default function IntelligenceAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'occupancy' | 'prices'>('stats');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const firebaseClient = createClient();
      const { data: { user: authUser } } = await firebaseClient.auth.getUser();
      
      if (!authUser) {
        router.push('/admin');
        return;
      }

      const { data: profile } = await firebaseClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin');
        return;
      }

      setUser(profile);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Intelligence Portal - Admin</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tourism Stats
          </button>
          <button
            onClick={() => setActiveTab('occupancy')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'occupancy'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Hotel Occupancy
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'prices'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Price Trends
          </button>
        </div>

        {activeTab === 'stats' && <TourismStatsForm />}
        {activeTab === 'occupancy' && <OccupancyForm />}
        {activeTab === 'prices' && <PriceTrendsForm />}
      </div>
    </div>
  );
}

function TourismStatsForm() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    domestic_visitors: 0,
    international_visitors: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const firebaseClient = createClient();
      const { error } = await firebaseClient
        .from('tourism_stats')
        .upsert(formData, { onConflict: 'year,month' });

      if (error) throw error;
      alert('Data saved successfully!');
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        domestic_visitors: 0,
        international_visitors: 0,
      });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Add Tourism Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Month</label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Domestic Visitors</label>
          <input
            type="number"
            value={formData.domestic_visitors}
            onChange={(e) => setFormData({ ...formData, domestic_visitors: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">International Visitors</label>
          <input
            type="number"
            value={formData.international_visitors}
            onChange={(e) => setFormData({ ...formData, international_visitors: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
            min="0"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Data'}
      </button>
    </form>
  );
}

function OccupancyForm() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    occupancy_percentage: 0,
    total_hotels: 0,
    peak_season: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const firebaseClient = createClient();
      const { error } = await firebaseClient
        .from('hotel_occupancy')
        .upsert(formData, { onConflict: 'year,month' });

      if (error) throw error;
      alert('Data saved successfully!');
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        occupancy_percentage: 0,
        total_hotels: 0,
        peak_season: false,
      });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Add Hotel Occupancy</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Month</label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Occupancy %</label>
          <input
            type="number"
            step="0.01"
            value={formData.occupancy_percentage}
            onChange={(e) => setFormData({ ...formData, occupancy_percentage: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Total Hotels</label>
          <input
            type="number"
            value={formData.total_hotels}
            onChange={(e) => setFormData({ ...formData, total_hotels: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="0"
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-gray-400">
            <input
              type="checkbox"
              checked={formData.peak_season}
              onChange={(e) => setFormData({ ...formData, peak_season: e.target.checked })}
              className="w-4 h-4"
            />
            Peak Season
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Data'}
      </button>
    </form>
  );
}

function PriceTrendsForm() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    avg_price: 0,
    bookings_count: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const firebaseClient = createClient();
      const { error } = await firebaseClient
        .from('price_trends')
        .upsert(formData, { onConflict: 'year,month' });

      if (error) throw error;
      alert('Data saved successfully!');
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        avg_price: 0,
        bookings_count: 0,
      });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Add Price Trends</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Month</label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Average Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.avg_price}
            onChange={(e) => setFormData({ ...formData, avg_price: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bookings Count</label>
          <input
            type="number"
            value={formData.bookings_count}
            onChange={(e) => setFormData({ ...formData, bookings_count: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
            min="0"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Data'}
      </button>
    </form>
  );
}

