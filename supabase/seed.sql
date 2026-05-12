-- Minimal seed data for Supabase fresh start

insert into public.packages (title, slug, duration, price, location, description, inclusions, is_popular, featured_image)
values
(
  'Kashmir Spring Escape',
  'kashmir-spring-escape',
  '5D/4N',
  18999,
  'Srinagar • Gulmarg • Pahalgam',
  'Spring meadows, local stays, and private transfers.',
  array['Hotel stay','Breakfast','Private cab'],
  true,
  '/videos/adventure-1.png'
)
on conflict (slug) do nothing;

insert into public.cabs (name, slug, description, duration, starting_from, vehicle_type, ideal_for, routes)
values
(
  'Srinagar Local + Airport Transfer',
  'srinagar-local-airport-transfer',
  'Private local transfer package',
  '1 Day',
  '₹3500',
  'Sedan',
  'Couples & small families',
  array['Airport','Dal Lake','Local city']
)
on conflict (slug) do nothing;

insert into public.places (name, slug, tag, location, description, highlights, best_time, ideal_stay, hero_image, is_featured)
values
(
  'Srinagar',
  'srinagar',
  'Houseboats • Shikara • Old City',
  'Jammu and Kashmir',
  'Iconic lake city with Mughal gardens and old town culture.',
  array['Dal Lake','Mughal Gardens','Shikara'],
  'Mar - Oct',
  '2-3 Days',
  '/videos/adventure-2.png',
  true
)
on conflict (slug) do nothing;

insert into public.chatbot_faqs (question, answer, category)
values
('Best time to visit Kashmir?', 'Spring to autumn for greenery and clear weather, winter for snowfall.', 'Travel')
on conflict do nothing;

insert into public.site_settings (id, home_content)
values
(
  1,
  '{
    "heroSlides":[
      {"src":"/videos/hero-bg.mp4","title":"Kashmir","subtitle":"Spring Meadows & Lakes"},
      {"src":"/videos/hero-2.mp4","title":"Valleys","subtitle":"In Full Bloom"}
    ]
  }'::jsonb
)
on conflict (id) do update
set home_content = excluded.home_content,
    updated_at = now();

-- Car rental fleet seed
insert into public.cars (name, slug, category, seats, transmission, fuel, price_per_day, price_per_km, image_url, features, sort_order)
values
('Toyota Etios', 'toyota-etios', 'Sedan', 4, 'Manual', 'Diesel', 2800, 16, '/videos/adventure-1.png', array['AC','Comfort seats','Airport pickup'], 10),
('Maruti Dzire', 'maruti-dzire', 'Sedan', 4, 'Manual', 'Petrol', 2600, 15, '/videos/adventure-2.png', array['AC','City + valley trips'], 20),
('Mahindra Thar', 'mahindra-thar', '4x4', 4, 'Manual', 'Diesel', 5200, 22, '/videos/adventure-1.png', array['4x4','Off-road','Adventure'], 30),
('Toyota Innova', 'toyota-innova', 'SUV/MPV', 7, 'Manual', 'Diesel', 4200, 20, '/videos/adventure-2.png', array['Spacious','Family trips','Long routes'], 40)
on conflict (slug) do nothing;

-- Offbeat trekking + hidden places seed
insert into public.offbeat_spots (type, name, region, difficulty, best_season, duration, altitude, description, hero_image, is_featured)
values
('trek','Tarsar Marsar Trek','Anantnag','Moderate','Jul - Sep','7 Days','~ 4,000m','Twin alpine lakes trek with unreal meadows and campsites.','/videos/adventure-1.png', true),
('trek','Kolahoi Glacier Trek','Pahalgam','Challenging','Jun - Sep','5 Days','~ 4,700m','Classic Kashmir glacier trek for serious hikers.','/videos/adventure-2.png', true),
('trek','Gurez Tulail Trail','Gurez Valley','Moderate','Jun - Oct','3-5 Days','~ 3,000m','Hidden routes in Gurez with river views and wooden villages.','/videos/adventure-2.png', false),
('hidden_place','Bangus Valley','Kupwara','Easy','May - Oct',null,null,'Wide grasslands, pine forests, and minimal crowds.','/videos/adventure-1.png', true),
('hidden_place','Doodhpathri Meadows','Budgam','Easy','Apr - Oct',null,null,'Green valleys and milky streams—perfect for spring picnics.','/videos/adventure-2.png', true),
('hidden_place','Aharbal Waterfall','Kulgam','Easy','Apr - Oct',null,null,'Powerful waterfall with forest roads and quiet viewpoints.','/videos/adventure-1.png', false)
on conflict do nothing;
