-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles (for admin role management, linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: packages
CREATE TABLE packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  duration TEXT NOT NULL, -- e.g. "5D/4N"
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  inclusions TEXT[],
  exclusions TEXT[],
  itinerary JSONB, -- Array of objects: { day: 1, title: "Arrival", description: "..." }
  is_popular BOOLEAN DEFAULT FALSE,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: package_images (Gallery for packages)
CREATE TABLE package_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: inquiries
CREATE TABLE inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  package_id UUID REFERENCES packages(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'booked', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: testimonials
CREATE TABLE testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: chatbot_faqs
CREATE TABLE chatbot_faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Profiles: Public read, Self update
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Packages: Public read, Admin write
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages are viewable by everyone" ON packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert packages" ON packages FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update packages" ON packages FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete packages" ON packages FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Package Images: Public read, Admin write
ALTER TABLE package_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Package images are viewable by everyone" ON package_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage package images" ON package_images FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Inquiries: Admin read/update, Public insert
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiry" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view inquiries" ON inquiries FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update inquiries" ON inquiries FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Testimonials: Public read (approved), Admin manage
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Chatbot FAQs: Public read, Admin manage
ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs are viewable by everyone" ON chatbot_faqs FOR SELECT USING (true);
CREATE POLICY "Admins can manage FAQs" ON chatbot_faqs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Function to handle new user signup (automatically create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table: places (for destinations)
CREATE TABLE places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tag TEXT,
  location TEXT,
  description TEXT,
  highlights TEXT[],
  best_time TEXT,
  ideal_stay TEXT,
  hero_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places: Public read, Admin manage
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Places are viewable by everyone" ON places FOR SELECT USING (true);
CREATE POLICY "Admins can insert places" ON places FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update places" ON places FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete places" ON places FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Insert some initial data
INSERT INTO chatbot_faqs (question, answer, category) VALUES
('When is the best time to visit Kashmir?', 'The best time to visit Kashmir is from March to October for pleasant weather. For snow and skiing, December to February is ideal.', 'General'),
('What are the package prices?', 'Our packages start from ₹12,499 depending on the duration and season. Please check our "Tour Packages" page for details.', 'Pricing'),
('Do you provide hotel and transport?', 'Yes, all our packages include hotel stays (3-star to 5-star) and comfortable transport (Sedan/SUV/Tempo Traveller).', 'Services');

-- Table: cabs (for cab plans & transfers)
CREATE TABLE cabs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration TEXT,              -- e.g. "Full Day", "3–7 Days"
  starting_from TEXT,         -- price label like "₹3,500"
  vehicle_type TEXT,          -- Sedan / SUV / Tempo Traveller / Mixed
  ideal_for TEXT,             -- Families, Groups etc.
  routes TEXT[],              -- array of route badges
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cabs: Public read, Admin manage
ALTER TABLE cabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cabs are viewable by everyone" ON cabs FOR SELECT USING (true);
CREATE POLICY "Admins can insert cabs" ON cabs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update cabs" ON cabs FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete cabs" ON cabs FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ============================================
-- KASHMIR TOURISM INTELLIGENCE PORTAL TABLES
-- ============================================

-- Table: tourism_stats
CREATE TABLE tourism_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  domestic_visitors INTEGER NOT NULL DEFAULT 0,
  international_visitors INTEGER NOT NULL DEFAULT 0,
  total_visitors INTEGER GENERATED ALWAYS AS (domestic_visitors + international_visitors) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Table: hotel_occupancy
CREATE TABLE hotel_occupancy (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  occupancy_percentage DECIMAL(5, 2) NOT NULL CHECK (occupancy_percentage >= 0 AND occupancy_percentage <= 100),
  total_hotels INTEGER DEFAULT 0,
  peak_season BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Table: price_trends
CREATE TABLE price_trends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  avg_price DECIMAL(10, 2) NOT NULL,
  bookings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Table: snowfall_tracker
CREATE TABLE snowfall_tracker (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT NOT NULL, -- 'Srinagar', 'Gulmarg', 'Pahalgam'
  snowfall_status TEXT NOT NULL, -- 'heavy', 'light', 'none'
  last_snowfall_date DATE,
  snow_depth_cm DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location)
);

-- RLS Policies for Intelligence Portal Tables

-- Tourism Stats: Public read, Admin write
ALTER TABLE tourism_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tourism stats are viewable by everyone" ON tourism_stats FOR SELECT USING (true);
CREATE POLICY "Admins can manage tourism stats" ON tourism_stats FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Hotel Occupancy: Public read, Admin write
ALTER TABLE hotel_occupancy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotel occupancy is viewable by everyone" ON hotel_occupancy FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotel occupancy" ON hotel_occupancy FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Price Trends: Public read, Admin write
ALTER TABLE price_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price trends are viewable by everyone" ON price_trends FOR SELECT USING (true);
CREATE POLICY "Admins can manage price trends" ON price_trends FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Snowfall Tracker: Public read, Admin write
ALTER TABLE snowfall_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Snowfall tracker is viewable by everyone" ON snowfall_tracker FOR SELECT USING (true);
CREATE POLICY "Admins can manage snowfall tracker" ON snowfall_tracker FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Indexes for better query performance
CREATE INDEX idx_tourism_stats_year_month ON tourism_stats(year, month);
CREATE INDEX idx_hotel_occupancy_year_month ON hotel_occupancy(year, month);
CREATE INDEX idx_price_trends_year_month ON price_trends(year, month);
CREATE INDEX idx_snowfall_tracker_location ON snowfall_tracker(location);