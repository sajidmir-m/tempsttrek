# Kashmir Tourism Intelligence Portal - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenWeather API (Optional - will use mock data if not set)
OPENWEATHER_API_KEY=your-openweather-api-key

# Google Maps API (Optional - traffic map won't work without it)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Database Setup

1. **Go to Supabase Dashboard** → SQL Editor

2. **Run the schema:**
   - Copy contents of `supabase_schema.sql`
   - Paste and run in SQL Editor
   - This creates all required tables

3. **Seed initial data:**
   - Copy contents of `seed_intelligence_data.sql`
   - Paste and run in SQL Editor
   - This adds sample data for 2023-2024

### 4. Run the Application

```bash
npm run dev
```

### 5. Access the Portal

- **Public Dashboard:** `http://localhost:3000/intelligence`
- **Admin Panel:** `http://localhost:3000/admin/intelligence`

## Getting API Keys

### OpenWeather API
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env.local` as `OPENWEATHER_API_KEY`

### Google Maps API
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable "Maps JavaScript API"
4. Create API key
5. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Admin Access

To access the admin panel:

1. Create a user account (sign up)
2. In Supabase Dashboard → SQL Editor, run:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
3. Log in with that email
4. Access `/admin/intelligence`

## Features Overview

### Public Dashboard (`/intelligence`)
- ✅ Tourism Statistics with charts
- ✅ Live Weather Forecast (3 locations)
- ✅ Snowfall Tracker
- ✅ Traffic Alerts with Google Maps
- ✅ Hotel Occupancy Trends
- ✅ Price Trend Analysis

### Admin Panel (`/admin/intelligence`)
- ✅ Add/Update Tourism Statistics
- ✅ Manage Hotel Occupancy Data
- ✅ Update Price Trends
- ✅ All data is stored in Supabase

## Data Entry

### Tourism Statistics
- Year, Month
- Domestic Visitors
- International Visitors
- Total is auto-calculated

### Hotel Occupancy
- Year, Month
- Occupancy Percentage (0-100)
- Total Hotels
- Peak Season checkbox

### Price Trends
- Year, Month
- Average Price (₹)
- Bookings Count

## Troubleshooting

### Charts not showing?
- Check browser console for errors
- Ensure Chart.js is installed: `npm install chart.js react-chartjs-2`

### Weather data not loading?
- Check OpenWeather API key in `.env.local`
- Without API key, mock data will be shown

### Google Maps not loading?
- Check Google Maps API key
- Ensure "Maps JavaScript API" is enabled
- Check browser console for API errors

### Database errors?
- Verify Supabase credentials in `.env.local`
- Check that tables exist in Supabase
- Verify RLS policies are set correctly

## Next Steps

1. **Add Real Data:**
   - Use admin panel to add actual tourism statistics
   - Update hotel occupancy from real sources
   - Add price trends from your bookings

2. **Customize:**
   - Adjust colors in `globals.css`
   - Modify chart styles in components
   - Add more locations to weather/snowfall

3. **Enhance:**
   - Set up automated data collection
   - Add email notifications
   - Create public API endpoints
   - Add export functionality

## Support

For issues or questions:
- Check the main README: `INTELLIGENCE_PORTAL_README.md`
- Review component code in `src/components/intelligence/`
- Check API routes in `src/app/api/`

---

**Ready to launch your Intelligence Portal! 🚀**

