'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SectionHeading from '@/components/ui/SectionHeading';
import PackageCard from '@/components/ui/PackageCard';
import { PackageCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Filter, Search } from 'lucide-react';
import { firebaseClient } from '@/lib/firebase-client';
import { MOCK_PACKAGES } from '@/data/packages';

export default function PackagesPage() {
  const [filterDuration, setFilterDuration] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await firebaseClient
          .from('packages')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
           const processed = data.map((pkg: any) => ({
             ...pkg,
             days: parseInt(pkg.duration) || 0 
           }));
           setPackages(processed);
        } else {
           const processedMock = MOCK_PACKAGES.map(pkg => ({
             ...pkg,
             days: parseInt(pkg.duration) || 0 
           }));
           setPackages(processedMock);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        const processedMock = MOCK_PACKAGES.map(pkg => ({
             ...pkg,
             days: parseInt(pkg.duration) || 0 
        }));
        setPackages(processedMock);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(pkg => {
    // Search Filter
    const searchMatch = !searchTerm || 
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Duration Filter
    let durationMatch = true;
    if (filterDuration === '< 5 days') durationMatch = pkg.days < 5;
    else if (filterDuration === '5-7 days') durationMatch = pkg.days >= 5 && pkg.days <= 7;
    else if (filterDuration === '> 7 days') durationMatch = pkg.days > 7;

    // Budget Filter
    let budgetMatch = true;
    if (filterBudget === '< 15k') budgetMatch = pkg.price < 15000;
    else if (filterBudget === '15k-25k') budgetMatch = pkg.price >= 15000 && pkg.price <= 25000;
    else if (filterBudget === '> 25k') budgetMatch = pkg.price > 25000;

    return searchMatch && durationMatch && budgetMatch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative text-white py-16 px-4 text-center overflow-hidden min-h-[300px] md:min-h-[380px] flex flex-col items-center justify-center">
        <Image
          src="/shikara.png"
          alt=""
          fill
          className="object-cover scale-[1.02]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-teal-900/40 to-teal-950/75" />
        <div className="relative z-10 max-w-3xl mx-auto px-2">
          <h1 className="text-4xl font-bold mb-4 [text-shadow:0_2px_24px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.9)]">
            Tour Packages
          </h1>
          <p className="text-xl text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.85)]">
            Find the perfect Kashmir itinerary for your next vacation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
            <input
              type="text"
              placeholder="Search packages by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700 font-semibold">
            <Filter size={20} />
            <span>Filter By:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
            >
              <option value="All">All Durations</option>
              <option value="< 5 days">Less than 5 days</option>
              <option value="5-7 days">5 - 7 days</option>
              <option value="> 7 days">More than 7 days</option>
            </select>

            <select 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
            >
              <option value="All">All Budgets</option>
              <option value="< 15k">Less than ₹15,000</option>
              <option value="15k-25k">₹15,000 - ₹25,000</option>
              <option value="> 25k">More than ₹25,000</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                title={pkg.title}
                duration={pkg.duration}
                price={pkg.price}
                image={pkg.featured_image}
                slug={pkg.slug}
                location={pkg.location}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-700">
            No packages found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
