# Weather API Debugging Guide

## Common Issues & Solutions

### 1. API Key Not Found

**Problem:** API key is not being read from environment variables.

**Solution:**
- Make sure `.env.local` file exists in the root directory
- Add: `OPENWEATHER_API_KEY=your_api_key_here`
- **Restart the Next.js dev server** after adding/changing `.env.local`
- Server-side environment variables require server restart

### 2. API Key Invalid

**Problem:** API key is set but OpenWeather API returns 401/403 error.

**Solution:**
- Verify your API key at https://openweathermap.org/api
- Make sure the API key is active
- Check if you've exceeded the free tier limit (60 calls/minute, 1,000,000 calls/month)

### 3. Network/CORS Issues

**Problem:** Fetch fails or times out.

**Solution:**
- Check your internet connection
- Verify OpenWeather API is accessible: https://api.openweathermap.org/data/2.5/forecast?lat=34.0837&lon=74.7973&appid=YOUR_KEY&units=metric
- Check browser console for CORS errors

### 4. Data Not Displaying

**Problem:** API works but data doesn't show in UI.

**Solution:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab - look for `/api/weather` request
- Verify the response format matches expected structure

## Debugging Steps

### Step 1: Check Environment Variable

```bash
# In your terminal, check if the variable is set
echo $OPENWEATHER_API_KEY  # Linux/Mac
# or check .env.local file exists and has the key
```

### Step 2: Check Server Logs

Look at your Next.js terminal output. You should see:
- `Weather API - API Key exists: true/false`
- `Fetching weather for Srinagar...`
- `Successfully fetched weather for Srinagar`

### Step 3: Test API Directly

Open in browser:
```
http://localhost:3000/api/weather
```

You should see JSON response. If you see an error, check the server logs.

### Step 4: Check Browser Console

1. Open `/intelligence` page
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for:
   - `Fetching weather data...`
   - `Weather data received: [...]`
   - Any error messages

### Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Refresh the page
3. Find `/api/weather` request
4. Check:
   - Status code (should be 200)
   - Response preview
   - Request headers

## Quick Fix Checklist

- [ ] `.env.local` file exists in project root
- [ ] `OPENWEATHER_API_KEY=your_key` is in `.env.local`
- [ ] No spaces around `=` sign
- [ ] Dev server was restarted after adding API key
- [ ] API key is valid and active
- [ ] No typos in variable name (`OPENWEATHER_API_KEY`)
- [ ] Check browser console for errors
- [ ] Check server terminal for errors

## Test Without API Key

If API key is not set, the system will return mock data automatically. You should see:
- Srinagar: 8°C, Partly Cloudy
- Gulmarg: 5°C, Cloudy  
- Pahalgam: 7°C, Partly Cloudy

If you see this, the component is working but API key is missing.

## Still Not Working?

1. **Check the exact error message** in browser console
2. **Check server logs** in terminal
3. **Verify API key** by testing directly: 
   ```
   https://api.openweathermap.org/data/2.5/weather?lat=34.0837&lon=74.7973&appid=YOUR_KEY&units=metric
   ```
4. **Restart dev server** completely (stop and start again)

