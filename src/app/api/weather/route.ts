import { NextResponse } from 'next/server';

const LOCATIONS = [
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973 },
  { name: 'Gulmarg', lat: 34.0489, lon: 74.3805 },
  { name: 'Pahalgam', lat: 34.0151, lon: 75.3188 },
];

export async function GET() {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    console.log('Weather API - API Key exists:', !!apiKey);
    console.log('Weather API - API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('Weather API - No API key found, returning mock data');
      // Return mock data if API key is not configured
      return NextResponse.json([
        {
          location: 'Srinagar',
          temperature: 8,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          snowProbability: 20,
          forecast: [
            { date: new Date().toISOString().split('T')[0], temp: 8, condition: 'Partly Cloudy', snowProb: 20 },
            { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], temp: 6, condition: 'Cloudy', snowProb: 40 },
            { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], temp: 4, condition: 'Snow', snowProb: 80 },
            { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], temp: 7, condition: 'Sunny', snowProb: 10 },
            { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], temp: 9, condition: 'Partly Cloudy', snowProb: 15 },
          ],
        },
        {
          location: 'Gulmarg',
          temperature: 5,
          condition: 'Cloudy',
          humidity: 70,
          windSpeed: 15,
          snowProbability: 40,
          forecast: [],
        },
        {
          location: 'Pahalgam',
          temperature: 7,
          condition: 'Partly Cloudy',
          humidity: 68,
          windSpeed: 10,
          snowProbability: 25,
          forecast: [],
        },
      ]);
    }

    const weatherData = await Promise.all(
      LOCATIONS.map(async (loc) => {
        try {
          const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lon}&appid=${apiKey}&units=metric`;
          console.log(`Fetching weather for ${loc.name}...`);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            let errorData: any;
            try {
              errorData = await response.json();
            } catch {
              const errorText = await response.text();
              errorData = { message: errorText };
            }
            
            console.error(`Weather API error for ${loc.name}:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            
            // If it's a 401/403, the API key is invalid
            if (response.status === 401 || response.status === 403) {
              console.error('⚠️ INVALID API KEY - Check your OPENWEATHER_API_KEY in .env.local');
            }
            
            throw new Error(`Weather API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
          }
          
          const data = await response.json();
          console.log(`Successfully fetched weather for ${loc.name}`);
          
          // Calculate snow probability from forecast
          const snowDays = data.list.filter((item: any) => 
            item.weather[0].main === 'Snow' || item.weather[0].main === 'Rain'
          ).length;
          const snowProbability = Math.round((snowDays / data.list.length) * 100);
          
          return {
            location: loc.name,
            temperature: Math.round(data.list[0].main.temp),
            condition: data.list[0].weather[0].description,
            humidity: data.list[0].main.humidity,
            windSpeed: Math.round(data.list[0].wind.speed * 3.6), // Convert m/s to km/h
            snowProbability,
            forecast: data.list.slice(0, 5).map((item: any) => ({
              date: item.dt_txt.split(' ')[0],
              temp: Math.round(item.main.temp),
              condition: item.weather[0].description,
              snowProb: item.weather[0].main === 'Snow' ? 80 : item.weather[0].main === 'Rain' ? 30 : 10,
            })),
          };
        } catch (error: any) {
          console.error(`Error fetching weather for ${loc.name}:`, error);
          console.error(`Error details:`, error.message, error.stack);
          // Return better fallback data
          return {
            location: loc.name,
            temperature: 8,
            condition: 'Data unavailable',
            humidity: 65,
            windSpeed: 12,
            snowProbability: 20,
            forecast: [],
          };
        }
      })
    );

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error in weather API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

