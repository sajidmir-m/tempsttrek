import { NextResponse } from 'next/server';

// Test endpoint to check if API key is working
export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'OPENWEATHER_API_KEY is not set in environment variables',
      hasKey: false,
    });
  }

  // Test with Srinagar coordinates
  try {
    const testUrl = `https://api.openweathermap.org/data/2.5/weather?lat=34.0837&lon=74.7973&appid=${apiKey}&units=metric`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `API returned error: ${data.message || response.statusText}`,
        statusCode: response.status,
        hasKey: true,
        apiResponse: data,
      });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'API key is working!',
      hasKey: true,
      testData: {
        location: 'Srinagar',
        temperature: data.main?.temp,
        condition: data.weather?.[0]?.description,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `Failed to connect to OpenWeather API: ${error.message}`,
      hasKey: true,
      error: error.toString(),
    });
  }
}

