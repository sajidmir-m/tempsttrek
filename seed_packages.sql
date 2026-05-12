-- Seed Data for Packages
-- Run this in your Supabase SQL Editor to populate the database

INSERT INTO packages (title, slug, duration, price, location, description, inclusions, exclusions, itinerary, is_popular, featured_image)
VALUES
(
  'Kashmir Delight',
  'kashmir-delight',
  '5D/4N',
  12500,
  'Srinagar, Gulmarg, Pahalgam',
  'Experience the best of Kashmir in 5 days. Visit the famous Dal Lake, the meadows of Gulmarg, and the valleys of Pahalgam.',
  ARRAY['Accommodation in 3-star hotels', 'Daily Breakfast & Dinner', 'All transfers by private cab', 'Shikara Ride on Dal Lake', 'Toll taxes and parking'],
  ARRAY['Airfare', 'Lunch', 'Personal expenses', 'Pony rides / Activities', 'GST'],
  '[
      {"day": 1, "title": "Arrival in Srinagar", "desc": "Pickup from airport, transfer to Houseboat. Evening Shikara ride."},
      {"day": 2, "title": "Srinagar to Gulmarg", "desc": "Day trip to Gulmarg. Enjoy Gondola ride (optional)."},
      {"day": 3, "title": "Srinagar to Pahalgam", "desc": "Drive to Pahalgam. Visit Aru Valley and Betaab Valley."},
      {"day": 4, "title": "Pahalgam to Srinagar", "desc": "Return to Srinagar. Local sightseeing (Mughal Gardens)."},
      {"day": 5, "title": "Departure", "desc": "Transfer to airport for departure."}
    ]'::jsonb,
  true,
  'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=2070&auto=format&fit=crop'
),
(
  'Magical Kashmir',
  'magical-kashmir',
  '6D/5N',
  15500,
  'Srinagar, Gulmarg, Pahalgam, Sonmarg',
  'A comprehensive 6-day tour covering all major destinations including the Golden Meadow, Sonmarg.',
  ARRAY['Accommodation in 3-star hotels', 'Daily Breakfast & Dinner', 'Private Cab for 6 days', 'Shikara Ride', 'All sightseeing'],
  ARRAY['Airfare', 'Lunch', 'Gondola Tickets', 'Garden Entry Fees', 'Tips'],
  '[
      {"day": 1, "title": "Arrival", "desc": "Welcome to Srinagar. Transfer to Hotel."},
      {"day": 2, "title": "Sonmarg Day Trip", "desc": "Full day excursion to Sonmarg (Thajiwas Glacier)."},
      {"day": 3, "title": "Gulmarg Excursion", "desc": "Day trip to Gulmarg for snow activities."},
      {"day": 4, "title": "Pahalgam Stay", "desc": "Drive to Pahalgam and overnight stay."},
      {"day": 5, "title": "Return to Srinagar", "desc": "Back to Srinagar. Shopping and leisure."},
      {"day": 6, "title": "Departure", "desc": "Drop at Airport."}
    ]'::jsonb,
  true,
  'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2070&auto=format&fit=crop'
),
(
  'Winter Wonderland',
  'winter-wonderland',
  '5D/4N',
  18999,
  'Gulmarg, Pahalgam',
  'Special winter package focused on snow activities and skiing in Gulmarg.',
  ARRAY['Heated Accommodation', 'Daily Breakfast & Dinner', 'Snow Chains Vehicle', 'Ski Equipment Rental Discount'],
  ARRAY['Ski Instructor', 'Gondola Phase 2', 'Lunch'],
  '[
      {"day": 1, "title": "Arrival", "desc": "Arrive in Srinagar, transfer to Gulmarg."},
      {"day": 2, "title": "Skiing in Gulmarg", "desc": "Full day for skiing and snow activities."},
      {"day": 3, "title": "Gulmarg to Pahalgam", "desc": "Scenic drive to Pahalgam."},
      {"day": 4, "title": "Pahalgam to Srinagar", "desc": "Return to Srinagar."},
      {"day": 5, "title": "Departure", "desc": "Transfer to airport."}
    ]'::jsonb,
  true,
  'https://images.unsplash.com/photo-1480497490787-505ec076689f?q=80&w=2069&auto=format&fit=crop'
),
(
  'Honeymoon Special',
  'honeymoon-special',
  '7D/6N',
  24999,
  'Srinagar, Houseboat, Gulmarg, Pahalgam',
  'Romantic getaway for couples with special candlelight dinner and flower decoration.',
  ARRAY['Honeymoon Suite', 'Candlelight Dinner', 'Flower Bed Decoration', 'Private Shikara Ride', 'Cake'],
  ARRAY['Flights', 'Personal Expenses', 'Adventure Activities'],
  '[
      {"day": 1, "title": "Welcome", "desc": "Arrival and Houseboat check-in."},
      {"day": 2, "title": "Romantic Srinagar", "desc": "Mughal Gardens and photo shoot."},
      {"day": 3, "title": "Gulmarg", "desc": "Day trip to Gulmarg."},
      {"day": 4, "title": "Pahalgam", "desc": "Overnight in Pahalgam."},
      {"day": 5, "title": "Pahalgam Leisure", "desc": "Leisure day in Pahalgam."},
      {"day": 6, "title": "Back to Srinagar", "desc": "Shopping and relaxing."},
      {"day": 7, "title": "Goodbye", "desc": "Departure."}
    ]'::jsonb,
  false,
  'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=2070&auto=format&fit=crop'
),
(
  'Budget Kashmir',
  'budget-kashmir',
  '4D/3N',
  9999,
  'Srinagar, Gulmarg',
  'Pocket-friendly tour covering the essentials of Kashmir.',
  ARRAY['Budget Hotels', 'Breakfast', 'Sharing Transport'],
  ARRAY['Lunch', 'Dinner', 'Entry Fees'],
  '[
      {"day": 1, "title": "Arrival", "desc": "Srinagar arrival."},
      {"day": 2, "title": "Gulmarg", "desc": "Day trip to Gulmarg."},
      {"day": 3, "title": "Srinagar Sightseeing", "desc": "Local sightseeing."},
      {"day": 4, "title": "Departure", "desc": "Airport drop."}
    ]'::jsonb,
  false,
  'https://images.unsplash.com/photo-1536295246797-175cb17c2688?q=80&w=2070&auto=format&fit=crop'
),
(
  'Luxury Escape',
  'luxury-escape',
  '6D/5N',
  35000,
  'Srinagar, Pahalgam, Sonmarg',
  'Stay in 5-star properties and travel in luxury SUVs.',
  ARRAY['5-Star Hotels', 'All Meals', 'Luxury SUV', 'Guide', 'VIP Darshan'],
  ARRAY['Flights', 'Tips'],
  '[
      {"day": 1, "title": "Royal Welcome", "desc": "Welcome drink and 5-star check-in."},
      {"day": 2, "title": "Sonmarg Luxury", "desc": "Private tour of Sonmarg."},
      {"day": 3, "title": "Pahalgam Retreat", "desc": "Stay at a luxury resort in Pahalgam."},
      {"day": 4, "title": "Pahalgam Leisure", "desc": "Golfing or relaxing."},
      {"day": 5, "title": "Srinagar Grandeur", "desc": "Grand houseboat stay."},
      {"day": 6, "title": "Departure", "desc": "VIP airport drop."}
    ]'::jsonb,
  false,
  'https://images.unsplash.com/photo-1562607335-5a50785f750b?q=80&w=2074&auto=format&fit=crop'
);
