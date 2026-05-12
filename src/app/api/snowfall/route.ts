import { NextResponse } from 'next/server';
import { createClient } from '@/lib/firebase-client';

const LOCATIONS = ['Srinagar', 'Gulmarg', 'Pahalgam'];

export async function GET() {
  try {
    const firebaseClient = createClient();
    
    // Fetch from database first
    const { data: dbData, error: dbError } = await firebaseClient
      .from('snowfall_tracker')
      .select('*')
      .in('location', LOCATIONS);

    if (!dbError && dbData && dbData.length > 0) {
      return NextResponse.json(dbData);
    }

    // If no database data, fetch from weather API and update
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      // Return mock data
      return NextResponse.json([
        { location: 'Srinagar', status: 'none', lastSnowfallDate: null, snowDepth: null },
        { location: 'Gulmarg', status: 'light', lastSnowfallDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], snowDepth: 15 },
        { location: 'Pahalgam', status: 'none', lastSnowfallDate: null, snowDepth: null },
      ]);
    }

    // Fetch current weather for each location
    const snowfallData = await Promise.all(
      LOCATIONS.map(async (loc) => {
        const coords: Record<string, { lat: number; lon: number }> = {
          Srinagar: { lat: 34.0837, lon: 74.7973 },
          Gulmarg: { lat: 34.0489, lon: 74.3805 },
          Pahalgam: { lat: 34.0151, lon: 75.3188 },
        };

        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords[loc].lat}&lon=${coords[loc].lon}&appid=${apiKey}&units=metric`;
          console.log(`Fetching snowfall data for ${loc}...`);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Weather API error for ${loc}:`, response.status, errorText);
            throw new Error(`Weather API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log(`Successfully fetched snowfall data for ${loc}`);
          
          const hasSnow = data.weather?.[0]?.main === 'Snow';
          const hasRain = data.weather?.[0]?.main === 'Rain';
          
          let status: 'heavy' | 'light' | 'none' = 'none';
          if (hasSnow) {
            status = data.snow?.['1h'] > 5 ? 'heavy' : 'light';
          } else if (hasRain && data.main.temp < 2) {
            status = 'light';
          }

          const snowfallRecord = {
            location: loc,
            status,
            lastSnowfallDate: hasSnow ? new Date().toISOString().split('T')[0] : null,
            snow_depth_cm: hasSnow ? (data.snow?.['1h'] || 0) : null,
          };

          // Update database (only if we have valid data)
          try {
            await firebaseClient
              .from('snowfall_tracker')
              .upsert(snowfallRecord, { onConflict: 'location' });
          } catch (dbError) {
            console.error(`Database update error for ${loc}:`, dbError);
            // Continue even if DB update fails
          }

          return {
            location: loc,
            status,
            lastSnowfallDate: snowfallRecord.lastSnowfallDate,
            snowDepth: snowfallRecord.snow_depth_cm,
          };
        } catch (error) {
          console.error(`Error fetching snowfall for ${loc}:`, error);
          return {
            location: loc,
            status: 'none' as const,
            lastSnowfallDate: null,
            snowDepth: null,
          };
        }
      })
    );

    return NextResponse.json(snowfallData);
  } catch (error) {
    console.error('Error in snowfall API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snowfall data' },
      { status: 500 }
    );
  }
}

