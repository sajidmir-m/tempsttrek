# Kashmir Tourism Intelligence Portal - Folder Structure

```
mir-baba-web/
├── src/
│   ├── app/
│   │   ├── intelligence/
│   │   │   └── page.tsx                    # Main intelligence dashboard page
│   │   ├── admin/
│   │   │   └── intelligence/
│   │   │       └── page.tsx                # Admin panel for data entry
│   │   ├── api/
│   │   │   ├── weather/
│   │   │   │   └── route.ts                # Weather API endpoint
│   │   │   ├── snowfall/
│   │   │   │   └── route.ts                # Snowfall API endpoint
│   │   │   └── traffic/
│   │   │       └── route.ts                # Traffic API endpoint
│   │   └── globals.css                     # Global styles + glassmorphism
│   │
│   ├── components/
│   │   ├── intelligence/
│   │   │   ├── DashboardLayout.tsx         # Sidebar + main layout
│   │   │   ├── TourismStats.tsx           # Tourism statistics component
│   │   │   ├── WeatherForecast.tsx        # Weather forecast component
│   │   │   ├── SnowfallTracker.tsx        # Snowfall tracker component
│   │   │   ├── TrafficAlerts.tsx          # Traffic alerts component
│   │   │   ├── HotelOccupancy.tsx         # Hotel occupancy component
│   │   │   ├── PriceTrends.tsx            # Price trends component
│   │   │   ├── AnimatedCounter.tsx         # Animated number counter
│   │   │   └── GoogleMapsLoader.tsx       # Google Maps script loader
│   │   └── layout/
│   │       └── ConditionalLayout.tsx       # Layout wrapper (excludes intelligence routes)
│   │
│   └── lib/
│       └── supabase.ts                     # Supabase client
│
├── supabase_schema.sql                     # Database schema (includes intelligence tables)
├── seed_intelligence_data.sql              # Sample data for testing
├── INTELLIGENCE_PORTAL_README.md           # Full documentation
├── SETUP_GUIDE.md                          # Quick setup instructions
└── FOLDER_STRUCTURE.md                     # This file
```

## Key Files

### Frontend Components
- **DashboardLayout.tsx** - Main layout with sidebar navigation
- **TourismStats.tsx** - Statistics dashboard with charts
- **WeatherForecast.tsx** - Weather data display
- **SnowfallTracker.tsx** - Snowfall status tracker
- **TrafficAlerts.tsx** - Google Maps traffic integration
- **HotelOccupancy.tsx** - Occupancy trends chart
- **PriceTrends.tsx** - Price analysis chart

### API Routes
- **/api/weather** - Fetches weather from OpenWeather API
- **/api/snowfall** - Fetches/updates snowfall data
- **/api/traffic** - Returns traffic metadata

### Database
- **tourism_stats** - Visitor statistics
- **hotel_occupancy** - Hotel occupancy data
- **price_trends** - Package price trends
- **snowfall_tracker** - Snowfall status per location

### Admin
- **/admin/intelligence** - Data entry forms for all tables

## Routes

- `/intelligence` - Public dashboard
- `/admin/intelligence` - Admin data entry panel

