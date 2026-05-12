# Kashmir Tourism Intelligence Portal

A comprehensive data intelligence dashboard for Kashmir tourism analytics, weather forecasts, traffic alerts, and market trends.

## Features

### 1. Tourism Statistics Dashboard
- Total tourists (yearly, monthly)
- Domestic vs International split
- Interactive line chart for monthly trends
- Bar chart for year comparison
- Animated counters for key metrics

### 2. Live Weather Forecast
- Real-time weather data from OpenWeather API
- 5-day forecast for Srinagar, Gulmarg, and Pahalgam
- Temperature, humidity, wind speed
- Snow probability indicators

### 3. Snowfall Tracker
- Real-time snowfall status (Heavy/Light/None)
- Last snowfall date tracking
- Snow depth measurements
- Visual badges with emoji indicators

### 4. Traffic Alerts
- Google Maps Traffic Layer integration
- Live Srinagar traffic map
- Congestion indicators (Low/Medium/High)

### 5. Hotel Occupancy Trend
- Monthly occupancy percentage trends
- Peak season indicators
- Interactive line charts
- Average occupancy calculations

### 6. Price Trend Analysis
- Average package price trends
- Month-over-month comparisons
- Percentage change indicators
- Booking count tracking

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS** (Styling)
- **Supabase** (Database)
- **Chart.js** (Graphs & Analytics)
- **OpenWeather API** (Weather Data)
- **Google Maps API** (Traffic & Maps)
- **TypeScript** (Type Safety)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Database Setup

1. Run the Supabase schema SQL:
   ```sql
   -- Run supabase_schema.sql in your Supabase SQL editor
   ```

2. Seed initial data:
   ```sql
   -- Run seed_intelligence_data.sql in your Supabase SQL editor
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/intelligence` to see the dashboard.

## Database Schema

### Tables

1. **tourism_stats**
   - `year` (INTEGER)
   - `month` (INTEGER)
   - `domestic_visitors` (INTEGER)
   - `international_visitors` (INTEGER)
   - `total_visitors` (GENERATED - auto-calculated)

2. **hotel_occupancy**
   - `year` (INTEGER)
   - `month` (INTEGER)
   - `occupancy_percentage` (DECIMAL)
   - `total_hotels` (INTEGER)
   - `peak_season` (BOOLEAN)

3. **price_trends**
   - `year` (INTEGER)
   - `month` (INTEGER)
   - `avg_price` (DECIMAL)
   - `bookings_count` (INTEGER)

4. **snowfall_tracker**
   - `location` (TEXT) - Unique
   - `snowfall_status` (TEXT) - 'heavy', 'light', 'none'
   - `last_snowfall_date` (DATE)
   - `snow_depth_cm` (DECIMAL)

## Admin Panel

Access the admin panel at `/admin/intelligence` to:
- Add/Update tourism statistics
- Manage hotel occupancy data
- Update price trends
- View and edit all intelligence data

**Note:** Admin access requires authentication and admin role in the `profiles` table.

## API Routes

### `/api/weather`
- Fetches weather data from OpenWeather API
- Returns data for Srinagar, Gulmarg, and Pahalgam
- Includes 5-day forecast

### `/api/snowfall`
- Fetches snowfall data from database
- Updates from OpenWeather API if needed
- Returns status for all tracked locations

### `/api/traffic`
- Returns traffic metadata
- Google Maps Traffic Layer is loaded client-side

## Data Sources

### 1. Tourist Statistics
- Manual entry via admin panel
- Can be sourced from:
  - Jammu and Kashmir Tourism Department
  - Annual reports PDF
  - RTI data
  - News portals

### 2. Weather & Snow Data
- **OpenWeather API** (Primary)
- **Open-Meteo** (Alternative - Free)
- Provides: Snowfall, Temperature, Precipitation, Forecast

### 3. Traffic Data
- **Google Maps Traffic Layer API**
- Requires Google Cloud API key
- Real-time congestion data

### 4. Hotel Occupancy
- Manual entry via admin panel
- Can be sourced from:
  - Hotel associations
  - Local tourism department
  - Survey data
  - Partner hotel login panel (future)

### 5. Price Trend Data
- Pulled from bookings database
- Average package prices per month
- Stored in Supabase `price_trends` table

## UI Features

- **Modern Dark Dashboard** - Professional analytics style
- **Glassmorphism Cards** - Beautiful frosted glass effect
- **Sidebar Navigation** - Smooth scrolling to sections
- **Mobile Responsive** - Works on all devices
- **Loading Skeletons** - Smooth loading states
- **Animated Counters** - Engaging number animations
- **Interactive Charts** - Hover tooltips and legends

## Business Advantage

This portal positions your business as:
- ✅ **Kashmir Tourism Intelligence Authority** (not just a travel agency)
- ✅ Builds media trust
- ✅ Attracts investor interest
- ✅ Enables government collaboration
- ✅ Massive SEO advantage

## Future Enhancements

- Real-time data sync from partner hotels
- Automated data collection from APIs
- Advanced analytics and predictions
- Export reports (PDF/Excel)
- Email alerts for significant changes
- Public API for data access

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Kashmir Tourism**

