-- Seed data for Kashmir Tourism Intelligence Portal
-- Run this after creating the tables in Supabase

-- Tourism Statistics (2023-2024 data)
INSERT INTO tourism_stats (year, month, domestic_visitors, international_visitors) VALUES
-- 2023
(2023, 1, 45000, 3200),
(2023, 2, 52000, 3800),
(2023, 3, 68000, 5200),
(2023, 4, 95000, 7800),
(2023, 5, 125000, 12000),
(2023, 6, 145000, 15000),
(2023, 7, 165000, 18000),
(2023, 8, 158000, 17000),
(2023, 9, 132000, 14000),
(2023, 10, 98000, 11000),
(2023, 11, 72000, 6500),
(2023, 12, 58000, 4500),
-- 2024
(2024, 1, 48000, 3500),
(2024, 2, 55000, 4000),
(2024, 3, 72000, 5800),
(2024, 4, 102000, 8500),
(2024, 5, 132000, 13000),
(2024, 6, 152000, 16000),
(2024, 7, 172000, 19000),
(2024, 8, 165000, 18000),
(2024, 9, 138000, 15000),
(2024, 10, 105000, 12000),
(2024, 11, 75000, 7000),
(2024, 12, 62000, 5000)
ON CONFLICT (year, month) DO UPDATE SET
  domestic_visitors = EXCLUDED.domestic_visitors,
  international_visitors = EXCLUDED.international_visitors,
  updated_at = NOW();

-- Hotel Occupancy (2023-2024 data)
INSERT INTO hotel_occupancy (year, month, occupancy_percentage, total_hotels, peak_season) VALUES
-- 2023
(2023, 1, 45.5, 250, false),
(2023, 2, 52.3, 250, false),
(2023, 3, 68.7, 250, false),
(2023, 4, 82.4, 250, true),
(2023, 5, 91.2, 250, true),
(2023, 6, 95.8, 250, true),
(2023, 7, 98.5, 250, true),
(2023, 8, 96.2, 250, true),
(2023, 9, 88.7, 250, true),
(2023, 10, 75.3, 250, false),
(2023, 11, 58.9, 250, false),
(2023, 12, 48.2, 250, false),
-- 2024
(2024, 1, 47.8, 250, false),
(2024, 2, 54.5, 250, false),
(2024, 3, 71.2, 250, false),
(2024, 4, 85.1, 250, true),
(2024, 5, 93.6, 250, true),
(2024, 6, 97.2, 250, true),
(2024, 7, 99.1, 250, true),
(2024, 8, 97.8, 250, true),
(2024, 9, 90.3, 250, true),
(2024, 10, 78.5, 250, false),
(2024, 11, 61.4, 250, false),
(2024, 12, 50.7, 250, false)
ON CONFLICT (year, month) DO UPDATE SET
  occupancy_percentage = EXCLUDED.occupancy_percentage,
  total_hotels = EXCLUDED.total_hotels,
  peak_season = EXCLUDED.peak_season,
  updated_at = NOW();

-- Price Trends (2023-2024 data)
INSERT INTO price_trends (year, month, avg_price, bookings_count) VALUES
-- 2023
(2023, 1, 18500, 320),
(2023, 2, 19200, 380),
(2023, 3, 21500, 520),
(2023, 4, 24800, 780),
(2023, 5, 27500, 1200),
(2023, 6, 28900, 1500),
(2023, 7, 31200, 1800),
(2023, 8, 30500, 1700),
(2023, 9, 26800, 1400),
(2023, 10, 23500, 1100),
(2023, 11, 20800, 650),
(2023, 12, 19500, 450),
-- 2024
(2024, 1, 19200, 350),
(2024, 2, 19800, 400),
(2024, 3, 22500, 580),
(2024, 4, 25800, 850),
(2024, 5, 28500, 1300),
(2024, 6, 29900, 1600),
(2024, 7, 32200, 1900),
(2024, 8, 31500, 1800),
(2024, 9, 27800, 1500),
(2024, 10, 24500, 1200),
(2024, 11, 21800, 700),
(2024, 12, 20500, 500)
ON CONFLICT (year, month) DO UPDATE SET
  avg_price = EXCLUDED.avg_price,
  bookings_count = EXCLUDED.bookings_count,
  updated_at = NOW();

-- Snowfall Tracker (Initial data)
INSERT INTO snowfall_tracker (location, snowfall_status, last_snowfall_date, snow_depth_cm) VALUES
('Srinagar', 'none', NULL, NULL),
('Gulmarg', 'light', CURRENT_DATE - INTERVAL '3 days', 15.5),
('Pahalgam', 'none', NULL, NULL)
ON CONFLICT (location) DO UPDATE SET
  snowfall_status = EXCLUDED.snowfall_status,
  last_snowfall_date = EXCLUDED.last_snowfall_date,
  snow_depth_cm = EXCLUDED.snow_depth_cm,
  updated_at = NOW();

