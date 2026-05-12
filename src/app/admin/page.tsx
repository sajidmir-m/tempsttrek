
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  MessageSquare, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard,
  Bell,
  Database,
  Users,
  Menu,
  X,
  Car,
  MapPin,
  Home,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PACKAGES } from '@/data/packages';
import { PLACES } from '@/data/places';
import { CAB_PLANS } from '@/data/cabs';
import AdminPackageModal from '@/components/admin/AdminPackageModal';
import AdminFAQModal from '@/components/admin/AdminFAQModal';
import AdminInquiryModal from '@/components/admin/AdminInquiryModal';
import AdminCabModal from '@/components/admin/AdminCabModal';
import AdminPlaceModal from '@/components/admin/AdminPlaceModal';
import AdminHomeMediaTab from '@/components/admin/AdminHomeMediaTab';
import AdminItinerariesTab from '@/components/admin/AdminItinerariesTab';
import AdminCarModal from '@/components/admin/AdminCarModal';
import CrmDashboard from '@/components/admin/CrmDashboard';

const CRM_WORKSPACE_LINKS: { href: string; label: string }[] = [
  { href: '/crm/dashboard', label: 'Dashboard' },
  { href: '/crm/manage-leads', label: 'Leads' },
  { href: '/crm/manage-quotations', label: 'Quotations' },
  { href: '/crm/itineraries', label: 'Itineraries' },
  { href: '/crm/assign-call/view', label: 'Assign call · view' },
  { href: '/crm/assign-call/lead-source', label: 'Assign call · sources' },
  { href: '/crm/manage-hotel', label: 'Hotels' },
  { href: '/crm/manage-expense', label: 'Expenses' },
  { href: '/crm/manage-invoice', label: 'Invoices' },
  { href: '/crm/manage-voucher', label: 'Vouchers' },
  { href: '/crm/ledger', label: 'Ledger' },
  { href: '/crm/manage-module', label: 'Modules' },
  { href: '/crm/settings', label: 'CRM settings' },
  { href: '/crm/users', label: 'CRM users' },
];

/** Shown on dashboard: what each admin sidebar area is for (tab ids must match sidebar). */
const ADMIN_CONSOLE_GUIDE: { tab: string; label: string; detail: string }[] = [
  { tab: 'inquiries', label: 'Inquiries', detail: 'Triage website enquiries, mark read, and follow up before quoting in CRM.' },
  { tab: 'packages', label: 'Tour Packages', detail: 'Publish and edit packages, durations, and highlights shown to customers.' },
  { tab: 'places', label: 'Places', detail: 'Destination copy, routes, and tips for place detail pages (photos can come from DB later).' },
  { tab: 'cabs', label: 'Cabs', detail: 'Sightseeing and transfer plans shown on the cab section of the site.' },
  { tab: 'car-rental', label: 'Car rental', detail: 'Self-drive fleet cards and rates for the car rental page.' },
  { tab: 'home-media', label: 'Home page media', detail: 'Hero images and clips wired to the public homepage.' },
  { tab: 'faqs', label: 'Chatbot FAQs', detail: 'Answers the on-site assistant can use; keep them aligned with live policies.' },
  { tab: 'users', label: 'Users', detail: 'Portal logins: create staff accounts and control who can open admin vs CRM.' },
];

export default function AdminPanel() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [portalRole, setPortalRole] = useState<'admin' | 'employee'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [cabs, setCabs] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [createEmployeeLoading, setCreateEmployeeLoading] = useState(false);
  
  // Modal States
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isCabModalOpen, setIsCabModalOpen] = useState(false);
  const [selectedCab, setSelectedCab] = useState<any>(null);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const sidebarNav = useMemo(() => {
    const full: { id: string; label: string; icon: typeof LayoutDashboard }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        id: 'inquiries',
        label: portalRole === 'employee' ? 'Bookings' : 'Inquiries',
        icon: MessageSquare,
      },
      { id: 'packages', label: 'Tour Packages', icon: Package },
      { id: 'places', label: 'Places', icon: MapPin },
      { id: 'cabs', label: 'Cabs', icon: Car },
      { id: 'car-rental', label: 'Car Rental', icon: Car },
      { id: 'home-media', label: 'Home page media', icon: Home },
      { id: 'crm', label: 'CRM', icon: ClipboardList },
      { id: 'faqs', label: 'Chatbot FAQs', icon: HelpCircle },
      { id: 'users', label: 'Users', icon: Users },
    ];
    const emp = new Set([
      'dashboard',
      'inquiries',
      'packages',
      'places',
      'cabs',
      'car-rental',
      'home-media',
      'crm',
      'faqs',
    ]);
    return portalRole === 'employee' ? full.filter((i) => emp.has(i.id)) : full;
  }, [portalRole]);

  const isAdmin = portalRole === 'admin';

  useEffect(() => {
    if (portalRole !== 'employee') return;
    const ok = [
      'dashboard',
      'inquiries',
      'packages',
      'places',
      'cabs',
      'car-rental',
      'home-media',
      'crm',
      'faqs',
    ];
    if (!ok.includes(activeTab)) setActiveTab('dashboard');
  }, [portalRole, activeTab]);

  // Mock Stats
  const stats = [
    { title: 'Total Inquiries', value: inquiries.length, icon: MessageSquare, color: 'bg-blue-500' },
    { title: 'Active Packages', value: packages.length, icon: Package, color: 'bg-teal-500' },
    { title: 'Pending Actions', value: inquiries.filter(i => i.status === 'pending').length, icon: Bell, color: 'bg-orange-500' },
  ];

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      if (session) fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }: { data: { role?: string } | null }) => {
        if (cancelled) return;
        if ((data?.role || '').toLowerCase() === 'employee') setPortalRole('employee');
        else setPortalRole('admin');
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const fetchData = async () => {
    // 1. Fetch Inquiries
    let allInquiries: any[] = [];
    
    // Try Supabase
    const { data: inqData, error: inqError } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (inqData) allInquiries = [...inqData];
    
    // Try LocalStorage (Fallback)
    if (typeof window !== 'undefined') {
      const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
      // Merge unique inquiries
      const existingIds = new Set(allInquiries.map(i => i.id));
      const newLocal = localInquiries.filter((i: any) => !existingIds.has(i.id));
      allInquiries = [...allInquiries, ...newLocal];
    }
    
    // Sort by date desc
    allInquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setInquiries(allInquiries);

    // 2. Fetch Packages
    const { data: pkgData } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    let currentPackages = [];
    if (pkgData) currentPackages = pkgData;
    else {
      // Fallback for packages (Mock data if DB is empty)
       currentPackages = [
         { id: '1', title: 'Magical Kashmir Family Tour', duration: '6D/5N', price: 18500, created_at: new Date().toISOString() },
         { id: '2', title: 'Romantic Honeymoon Special', duration: '5D/4N', price: 24999, created_at: new Date().toISOString() }
       ];
    }
    setPackages(currentPackages);

    // 3. Fetch FAQs
    const { data: faqData } = await supabase
      .from('chatbot_faqs')
      .select('*')
      .order('category', { ascending: true });
    
    if (faqData) setFaqs(faqData);

    // 4. Fetch Cabs
    const { data: cabData } = await supabase
      .from('cabs')
      .select('*')
      .order('created_at', { ascending: false });

    if (cabData) setCabs(cabData);

    // 5. Fetch Cars (Car Rental)
    const { data: carData } = await supabase
      .from('cars')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (carData) setCars(carData);

    // 6. Fetch Places
    const { data: placeData } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (placeData && placeData.length > 0) setPlaces(placeData);
    else setPlaces(PLACES); // fallback to static list for now

    // 7. Fetch Users
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userData) setUsers(userData);
  };

  // Helper to get package details
  const getPackageDetails = (packageId: string) => {
    return packages.find(p => p.id === packageId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const deleteInquiry = async (id: string) => {
    if(!confirm('Are you sure you want to delete this inquiry?')) return;

    // Try deleting from Supabase
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    
    // Also delete from LocalStorage if present
    const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const updatedLocal = localInquiries.filter((i: any) => i.id !== id);
    localStorage.setItem('inquiries', JSON.stringify(updatedLocal));

    // Update State
    setInquiries(prev => prev.filter(i => i.id !== id));
  };

  const toggleInquiryStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'read' : 'pending';
    
    // Update Supabase
    await supabase.from('inquiries').update({ status: newStatus }).eq('id', id);

    // Update LocalStorage
    const localInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const updatedLocal = localInquiries.map((i: any) => i.id === id ? { ...i, status: newStatus } : i);
    localStorage.setItem('inquiries', JSON.stringify(updatedLocal));

    // Update State
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const handleSeedData = async () => {
    if(!confirm('Are you sure you want to seed the database? This will insert mock packages.')) return;
    setLoading(true);
    try {
        const { error } = await supabase.from('packages').insert(MOCK_PACKAGES.map(p => {
            // Remove ID to let Supabase generate UUID
            const { id, ...rest } = p; 
            return rest;
        }));
        
        if (error) throw error;
        alert('Database seeded successfully!');
        fetchData(); // Refresh
    } catch (err: any) {
        alert('Error seeding database: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) {
      alert('Error deleting package: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleSeedCabs = async () => {
    if (!confirm('Seed or refresh cab plans from defaults? Existing slugs will be updated.')) return;
    setLoading(true);
    try {
      const payload = CAB_PLANS.map((c) => ({
        name: c.name,
        slug: c.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: c.description,
        duration: c.duration,
        starting_from: c.startingFrom,
        vehicle_type: c.vehicle_type || null,
        ideal_for: c.idealFor,
        routes: c.routes,
      }));
      const { error } = await supabase.from('cabs').upsert(payload, { onConflict: 'slug' });
      if (error) throw error;
      alert('Cab plans saved (new rows inserted, existing slugs updated).');
      fetchData();
    } catch (err: any) {
      alert('Error seeding cab plans: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedPlaces = async () => {
    if (!confirm('Seed or refresh places from defaults? Existing slugs will be updated.')) return;
    setLoading(true);
    try {
      const payload = PLACES.map((p) => ({
        name: p.name,
        slug: p.slug,
        tag: p.tag,
        location: p.location,
        description: p.description,
        highlights: p.highlights,
        best_time: p.bestTime,
        ideal_stay: p.idealStay,
        hero_image: p.heroImage || null,
        is_featured: false,
      }));
      const { error } = await supabase.from('places').upsert(payload, { onConflict: 'slug' });
      if (error) throw error;
      alert('Places saved (new rows inserted, existing slugs updated).');
      fetchData();
    } catch (err: any) {
      alert('Error seeding places: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const { error } = await supabase.from('chatbot_faqs').delete().eq('id', id);
    if (error) {
      alert('Error deleting FAQ: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleDeleteCab = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cab plan?')) return;
    const { error } = await supabase.from('cabs').delete().eq('id', id);
    if (error) {
      alert('Error deleting cab plan: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this car?')) return;
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) {
      alert('Error deleting car: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!confirm('Are you sure you want to delete this place?')) return;
    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) {
      alert('Error deleting place: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleUpdateUserRole = async (userId: string, nextRole: 'admin' | 'employee' | 'user') => {
    if (!isAdmin) return;
    const { error } = await supabase.from('profiles').update({ role: nextRole }).eq('id', userId);
    if (error) {
      alert('Error updating role: ' + error.message);
      return;
    }
    fetchData();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const em = newEmployeeEmail.trim().toLowerCase();
    const pw = newEmployeePassword;
    if (!em || !pw) {
      alert('Enter email and password for the new employee.');
      return;
    }
    if (pw.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setCreateEmployeeLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('You are not signed in.');
        return;
      }
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: em, password: pw }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || 'Failed to create employee');
        return;
      }
      setNewEmployeeEmail('');
      setNewEmployeePassword('');
      alert(`Employee created. They can sign in at /admin with:\n${em}`);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setCreateEmployeeLoading(false);
    }
  };

  // Login Screen
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-800">Staff &amp; admin portal</h1>
            <p className="text-gray-500 mt-2">
              Owners use full admin accounts. Employees use profiles with role <code className="text-xs bg-gray-100 px-1 rounded">employee</code>.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-teal-900 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-teal-900 text-white flex-shrink-0 flex-col fixed lg:static h-screen lg:h-auto z-50 transition-transform duration-300 flex ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Tempesttrek {portalRole === 'employee' ? 'Staff' : 'Admin'}
          </h1>
          <p className="text-teal-400 text-sm mt-1">
            {portalRole === 'employee' ? 'Packages · bookings · CRM' : 'Management console'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {sidebarNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'crm') {
                  router.push('/crm');
                } else {
                  setActiveTab(item.id);
                }
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all ${
                activeTab === item.id 
                  ? 'bg-teal-800 text-white shadow-lg' 
                  : 'text-teal-100 hover:bg-teal-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'inquiries' && inquiries.filter(i => i.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {inquiries.filter(i => i.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="max-w-7xl mx-auto p-4 pt-20 md:p-8 md:pt-24 lg:pt-8">

          {/* Mobile Navigation Tabs */}
          <div className="mb-6 flex lg:hidden gap-2 overflow-x-auto pb-2">
            {sidebarNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'crm') router.push('/crm');
                  else setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {item.id === 'inquiries' && inquiries.filter(i => i.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {inquiries.filter(i => i.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
            </div>
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-opacity-20`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900">Admin console — what to do here</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-3xl">
                    Admins manage the public website and portal accounts from the sidebar. Sales pipelines, quotations,
                    itineraries, and future ERP modules (for example hotel inventory) live in{' '}
                    <span className="font-medium text-gray-700">CRM</span> — use the shortcuts below.
                  </p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {ADMIN_CONSOLE_GUIDE.map((row) => (
                      <li key={row.tab}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(row.tab);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/80"
                        >
                          <span className="font-semibold text-gray-900">{row.label}</span>
                          <span className="mt-1 block text-sm text-gray-600">{row.detail}</span>
                          <span className="mt-2 inline-block text-xs font-medium text-teal-700">Open tab →</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-gray-500">
                    Sidebar item <span className="font-medium text-gray-700">CRM</span> opens the full CRM shell; the
                    Hotel screen there is a placeholder until master data tables and APIs are connected.
                  </p>
                </div>
              )}

              {!isAdmin && (
                <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Your access: </span>
                  Use the sidebar for <span className="font-medium">Bookings</span>, <span className="font-medium">Packages</span>,{' '}
                  <span className="font-medium">Places</span>, <span className="font-medium">Cabs</span>,{' '}
                  <span className="font-medium">Car rental</span>, <span className="font-medium">Home page media</span>, and{' '}
                  <span className="font-medium">FAQs</span>. Open <span className="font-medium">CRM</span> (or the shortcuts below) for
                  leads, quotations, hotels, expenses, and the rest. Only admins manage <span className="font-medium">Users</span>.
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">CRM workspace</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Jump straight to leads, quotes, itineraries, and the rest of the CRM without hunting the sidebar.
                    </p>
                  </div>
                  <Link
                    href="/crm/dashboard"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                  >
                    Open CRM
                    <ExternalLink size={16} aria-hidden />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CRM_WORKSPACE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                    >
                      {item.label}
                      <ExternalLink size={14} className="text-gray-400" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                 <p className="text-gray-500 text-sm">No recent activity to display.</p>
              </div>
            </motion.div>
          )}

          {/* Inquiries View */}
          {activeTab === 'inquiries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-left">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Info</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package / Message</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inquiries.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                               <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                               <p>No inquiries found yet.</p>
                            </td>
                         </tr>
                      ) : (
                        inquiries
                        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.email.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((inq) => {
                          const pkgDetails = inq.package_id ? getPackageDetails(inq.package_id) : null;
                          return (
                          <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(inq.created_at).toLocaleDateString()}
                              <br/>
                              <span className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleTimeString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                                  {inq.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900">{inq.name}</span>
                                  <span className="text-sm text-gray-500">{inq.email}</span>
                                  <span className="text-xs text-gray-400">{inq.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {pkgDetails ? (
                                <div className="mb-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
                                  <p className="text-sm font-bold text-teal-800">{pkgDetails.title}</p>
                                  <p className="text-xs text-teal-600 font-medium">{pkgDetails.duration}</p>
                                </div>
                              ) : inq.package_id ? (
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                  <p className="text-sm font-bold text-gray-700">Package ID: {inq.package_id}</p>
                                  <p className="text-xs text-gray-500">Details not found</p>
                                </div>
                              ) : null}
                              <p className="text-sm text-gray-600 max-w-xs truncate" title={inq.message}>
                                {inq.message}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                inq.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {inq.status === 'read' ? 'Read' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => toggleInquiryStatus(inq.id, inq.status)}
                                className="text-teal-600 hover:text-teal-900 mr-3"
                                title="Toggle Status"
                              >
                                {inq.status === 'read' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedInquiry(inq);
                                  setIsInquiryModalOpen(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 mr-3"
                                title="View Details"
                              >
                                <Search size={18} />
                              </button>
                              {isAdmin && (
                              <button 
                                onClick={() => deleteInquiry(inq.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                              )}
                            </td>
                          </tr>
                        )})
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Packages View */}
          {activeTab === 'packages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tour Packages</h3>
                  {!isAdmin && <p className="text-xs text-gray-500 mt-1">View only · contact admin for changes</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && (
                  <button 
                    onClick={handleSeedData}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Database size={18} /> Seed Data
                  </button>
                  )}
                  {isAdmin && (
                  <button 
                    onClick={() => {
                      setSelectedPackage(null);
                      setIsPackageModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
                  >
                    <Plus size={18} /> Add New Package
                  </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all relative">
                    {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPackage(pkg);
                          setIsPackageModalOpen(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-teal-600 hover:text-teal-800 shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePackage(pkg.id);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    )}
                    
                    <div className="h-48 bg-gray-200 relative">
                      {pkg.featured_image ? (
                        <img src={pkg.featured_image} alt={pkg.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Package size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-lg text-gray-900 leading-tight">{pkg.title}</h3>
                         <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg">{pkg.duration}</span>
                      </div>
                      <p className="text-xl font-bold text-teal-600 mb-4">₹{pkg.price?.toLocaleString()}</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.inclusions?.slice(0, 3).map((inc: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">{inc}</span>
                        ))}
                        {pkg.inclusions?.length > 3 && (
                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">+{pkg.inclusions.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Places View */}
          {activeTab === 'places' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Places</h3>
                {isAdmin && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleSeedPlaces}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Database size={18} /> Seed Places
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlace(null);
                      setIsPlaceModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
                  >
                    <Plus size={18} /> Add New Place
                  </button>
                </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((pl) => (
                  <div key={pl.id || pl.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all relative">
                    {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlace(pl);
                          setIsPlaceModalOpen(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-teal-600 hover:text-teal-800 shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      {pl.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlace(pl.id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    )}

                    <div className="h-40 bg-gray-200 relative">
                      {pl.hero_image ? (
                        <img src={pl.hero_image} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <MapPin size={40} />
                        </div>
                      )}
                      {pl.tag && (
                        <span className="absolute top-3 left-3 bg-white/90 text-teal-700 text-xs font-semibold px-2 py-1 rounded-lg">
                          {pl.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{pl.name}</h3>
                        {(pl.best_time || pl.bestTime) && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg">
                            {pl.best_time || pl.bestTime}
                          </span>
                        )}
                      </div>
                      {pl.location && <p className="text-xs text-gray-500 mb-1">{pl.location}</p>}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pl.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pl.highlights?.slice(0, 3).map((h: string, i: number) => (
                          <span key={i} className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">
                            {h}
                          </span>
                        ))}
                        {pl.highlights?.length > 3 && (
                          <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">
                            +{pl.highlights.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {places.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                    <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium mb-1">No places added yet.</p>
                    <p className="text-sm mb-4">Use &quot;Seed Places&quot; to insert defaults or add manually.</p>
                    {isAdmin && (
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={handleSeedPlaces}
                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Database size={16} /> Seed Places
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlace(null);
                          setIsPlaceModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
                      >
                        <Plus size={16} /> Add New Place
                      </button>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Cabs View */}
          {activeTab === 'cabs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Cab Plans</h3>
                {isAdmin && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleSeedCabs}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Database size={18} /> Seed Cabs
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCab(null);
                      setIsCabModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
                  >
                    <Plus size={18} /> Add New Cab Plan
                  </button>
                </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cabs.map((cab) => (
                  <div
                    key={cab.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all relative"
                  >
                    {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCab(cab);
                          setIsCabModalOpen(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-teal-600 hover:text-teal-800 shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCab(cab.id);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    )}

                    <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-500 flex items-center justify-center text-white">
                      <div className="flex flex-col items-center gap-1">
                        <Car size={32} />
                        <span className="text-xs uppercase tracking-wide opacity-80">
                          {cab.vehicle_type || "Private Cab"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
                          {cab.name}
                        </h3>
                        {cab.duration && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                            {cab.duration}
                          </span>
                        )}
                      </div>
                      {cab.starting_from && (
                        <p className="text-sm font-semibold text-teal-600 mb-2">
                          From {cab.starting_from}
                        </p>
                      )}
                      {cab.ideal_for && (
                        <p className="text-xs text-gray-500 mb-2">Ideal for: {cab.ideal_for}</p>
                      )}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{cab.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cab.routes?.slice(0, 3).map((r: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100"
                          >
                            {r}
                          </span>
                        ))}
                        {cab.routes?.length > 3 && (
                          <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">
                            +{cab.routes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {cabs.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                    <Car size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium mb-1">No cab plans added yet.</p>
                    <p className="text-sm mb-4">
                      Use &quot;Add New Cab Plan&quot; to create your first cab package (day trips, airport
                      transfers, multi-day tours).
                    </p>
                    {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedCab(null);
                        setIsCabModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      <Plus size={16} /> Add New Cab Plan
                    </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Car Rental View (admin only) */}
          {activeTab === 'car-rental' && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Car Rental Fleet</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedCar(null);
                      setIsCarModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
                  >
                    <Plus size={18} /> Add New Car
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all relative"
                  >
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCar(car);
                          setIsCarModalOpen(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-teal-600 hover:text-teal-800 shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCar(car.id);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="h-32 bg-gradient-to-r from-sky-600 to-emerald-500 flex items-center justify-center text-white">
                      <div className="flex flex-col items-center gap-1">
                        <Car size={32} />
                        <span className="text-xs uppercase tracking-wide opacity-80">{car.category || 'Car'}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">{car.name}</h3>
                        {car.price_per_day ? (
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                            ₹{Number(car.price_per_day).toLocaleString()}/day
                          </span>
                        ) : (
                          <span className="bg-gray-50 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                            Quote
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {car.seats ? `${car.seats} seats` : '—'} • {car.transmission || '—'} • {car.fuel || '—'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {car.features?.slice(0, 4).map((f: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100"
                          >
                            {f}
                          </span>
                        ))}
                        {car.features?.length > 4 && (
                          <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">
                            +{car.features.length - 4} more
                          </span>
                        )}
                      </div>
                      {car.is_available === false && (
                        <p className="text-xs font-semibold text-red-600 mt-3">Not available</p>
                      )}
                    </div>
                  </div>
                ))}

                {cars.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                    <Car size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium mb-1">No cars added yet.</p>
                    <p className="text-sm mb-4">Click “Add New Car” to create your fleet list.</p>
                    <button
                      onClick={() => {
                        setSelectedCar(null);
                        setIsCarModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      <Plus size={16} /> Add New Car
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'home-media' && isAdmin && <AdminHomeMediaTab />}

          {/* CRM now lives in /crm */}

          {/* FAQs View */}
          {activeTab === 'faqs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Chatbot FAQs</h3>
                {isAdmin && (
                <button 
                  onClick={() => {
                    setSelectedFAQ(null);
                    setIsFAQModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 font-medium"
                >
                  <Plus size={18} /> Add New FAQ
                </button>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Answer</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {faqs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <HelpCircle size={48} className="mx-auto mb-3 text-gray-300" />
                          <p>No FAQs found yet.</p>
                        </td>
                      </tr>
                    ) : (
                      faqs
                      .filter(f => f.question.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((faq) => (
                        <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{faq.question}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={faq.answer}>{faq.answer}</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg border border-blue-100">
                              {faq.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isAdmin && (
                            <button 
                              onClick={() => {
                                setSelectedFAQ(faq);
                                setIsFAQModalOpen(true);
                              }}
                              className="text-teal-600 hover:text-teal-900 mr-3"
                            >
                              <Edit size={18} />
                            </button>
                            )}
                            {isAdmin && (
                            <button 
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        {/* Users View */}
           {activeTab === 'users' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h3 className="text-lg font-bold text-gray-900 mb-6">Registered Users</h3>
               {isAdmin && (
                 <form
                   onSubmit={handleCreateEmployee}
                   className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
                 >
                   <div>
                     <h4 className="font-bold text-gray-900">Create employee account</h4>
                     <p className="text-sm text-gray-500 mt-1">
                       Creates a Supabase Auth user with a confirmed email so they can sign in at{' '}
                       <code className="text-xs bg-gray-100 px-1 rounded">/admin</code> immediately. Requires{' '}
                       <code className="text-xs bg-gray-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> on the server.
                     </p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-gray-600 mb-1">Employee email</label>
                       <input
                         type="email"
                         autoComplete="off"
                         value={newEmployeeEmail}
                         onChange={(e) => setNewEmployeeEmail(e.target.value)}
                         className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                         placeholder="staff@example.com"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-gray-600 mb-1">Temporary password</label>
                       <input
                         type="password"
                         autoComplete="new-password"
                         value={newEmployeePassword}
                         onChange={(e) => setNewEmployeePassword(e.target.value)}
                         className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                         placeholder="At least 6 characters"
                       />
                     </div>
                   </div>
                   <button
                     type="submit"
                     disabled={createEmployeeLoading}
                     className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 text-sm font-semibold disabled:opacity-60"
                   >
                     {createEmployeeLoading ? 'Creating…' : 'Create employee'}
                   </button>
                 </form>
               )}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-100 text-left">
                       <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                       <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                       <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                       <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {users.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                           <Users size={48} className="mx-auto mb-3 text-gray-300" />
                           <p>No users found.</p>
                         </td>
                       </tr>
                     ) : (
                       users
                       .filter(u => (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
                       .map((user) => (
                         <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                                 {(user.email || 'U').charAt(0).toUpperCase()}
                               </div>
                               <div className="flex flex-col">
                                 <span className="font-semibold text-gray-900">{user.email || 'No Email'}</span>
                                 <span className="text-xs text-gray-400">ID: {user.id}</span>
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                             }`}>
                               {user.role || 'user'}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-500">
                             {new Date(user.created_at).toLocaleDateString()}
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isAdmin && (
                              <div className="inline-flex items-center gap-2 mr-3">
                                <button
                                  className="text-[11px] px-2 py-1 rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50"
                                  onClick={() => handleUpdateUserRole(user.id, 'admin')}
                                  title="Set admin"
                                >
                                  Admin
                                </button>
                                <button
                                  className="text-[11px] px-2 py-1 rounded-md border border-teal-200 text-teal-700 hover:bg-teal-50"
                                  onClick={() => handleUpdateUserRole(user.id, 'employee')}
                                  title="Set employee"
                                >
                                  Employee
                                </button>
                                <button
                                  className="text-[11px] px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                                  onClick={() => handleUpdateUserRole(user.id, 'user')}
                                  title="Set user"
                                >
                                  User
                                </button>
                              </div>
                            )}
                            <button
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Details"
                              onClick={() => alert(`User Details:\nID: ${user.id}\nEmail: ${user.email}\nRole: ${user.role}`)}
                            >
                              <Search size={18} />
                            </button>
                          </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
             </motion.div>
           )}

         </div>
       </main>

      {/* Modals */}
      <AdminPackageModal 
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onSave={() => {
          fetchData();
          setIsPackageModalOpen(false);
        }}
        packageData={selectedPackage}
      />

      <AdminCabModal
        isOpen={isCabModalOpen}
        onClose={() => setIsCabModalOpen(false)}
        onSave={() => {
          fetchData();
          setIsCabModalOpen(false);
        }}
        cabData={selectedCab}
      />

      <AdminCarModal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        onSave={() => {
          fetchData();
          setIsCarModalOpen(false);
        }}
        carData={selectedCar}
      />

      <AdminPlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onSave={() => {
          fetchData();
          setIsPlaceModalOpen(false);
        }}
        placeData={selectedPlace}
      />
      
      <AdminFAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
        onSave={() => {
          fetchData();
          setIsFAQModalOpen(false);
        }}
        faqData={selectedFAQ}
      />

      <AdminInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        inquiry={selectedInquiry}
      />
    </div>
  );
}
