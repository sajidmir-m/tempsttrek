
export const MOCK_PACKAGES = [
  {
    id: "1",
    title: "Kashmir Delight",
    slug: "kashmir-delight",
    duration: "5D/4N",
    price: 12500,
    featured_image: "",
    location: "Srinagar, Gulmarg, Pahalgam",
    description: "Experience the best of Kashmir in 5 days. Visit the famous Dal Lake, the meadows of Gulmarg, and the valleys of Pahalgam.",
    inclusions: ["Accommodation in 3-star hotels", "Daily Breakfast & Dinner", "All transfers by private cab", "Shikara Ride on Dal Lake", "Toll taxes and parking"],
    exclusions: ["Airfare", "Lunch", "Personal expenses", "Pony rides / Activities", "GST"],
    itinerary: [
      { day: 1, title: "Arrival in Srinagar", desc: "Pickup from airport, transfer to Houseboat. Evening Shikara ride." },
      { day: 2, title: "Srinagar to Gulmarg", desc: "Day trip to Gulmarg. Enjoy Gondola ride (optional)." },
      { day: 3, title: "Srinagar to Pahalgam", desc: "Drive to Pahalgam. Visit Aru Valley and Betaab Valley." },
      { day: 4, title: "Pahalgam to Srinagar", desc: "Return to Srinagar. Local sightseeing (Mughal Gardens)." },
      { day: 5, title: "Departure", desc: "Transfer to airport for departure." }
    ],
    is_popular: true
  },
  {
    id: "2",
    title: "Magical Kashmir",
    slug: "magical-kashmir",
    duration: "6D/5N",
    price: 15500,
    featured_image: "",
    location: "Srinagar, Gulmarg, Pahalgam, Sonmarg",
    description: "A comprehensive 6-day tour covering all major destinations including the Golden Meadow, Sonmarg.",
    inclusions: ["Accommodation in 3-star hotels", "Daily Breakfast & Dinner", "Private Cab for 6 days", "Shikara Ride", "All sightseeing"],
    exclusions: ["Airfare", "Lunch", "Gondola Tickets", "Garden Entry Fees", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival", desc: "Welcome to Srinagar. Transfer to Hotel." },
      { day: 2, title: "Sonmarg Day Trip", desc: "Full day excursion to Sonmarg (Thajiwas Glacier)." },
      { day: 3, title: "Gulmarg Excursion", desc: "Day trip to Gulmarg for snow activities." },
      { day: 4, title: "Pahalgam Stay", desc: "Drive to Pahalgam and overnight stay." },
      { day: 5, title: "Return to Srinagar", desc: "Back to Srinagar. Shopping and leisure." },
      { day: 6, title: "Departure", desc: "Drop at Airport." }
    ],
    is_popular: true
  },
  {
    id: "3",
    title: "Winter Wonderland",
    slug: "winter-wonderland",
    duration: "5D/4N",
    price: 18999,
    featured_image: "",
    location: "Gulmarg, Pahalgam",
    description: "Special winter package focused on snow activities and skiing in Gulmarg.",
    inclusions: ["Heated Accommodation", "Daily Breakfast & Dinner", "Snow Chains Vehicle", "Ski Equipment Rental Discount"],
    exclusions: ["Ski Instructor", "Gondola Phase 2", "Lunch"],
    itinerary: [
      { day: 1, title: "Arrival", desc: "Arrive in Srinagar, transfer to Gulmarg." },
      { day: 2, title: "Skiing in Gulmarg", desc: "Full day for skiing and snow activities." },
      { day: 3, title: "Gulmarg to Pahalgam", desc: "Scenic drive to Pahalgam." },
      { day: 4, title: "Pahalgam to Srinagar", desc: "Return to Srinagar." },
      { day: 5, title: "Departure", desc: "Transfer to airport." }
    ],
    is_popular: true
  },
  {
    id: "4",
    title: "Honeymoon Special",
    slug: "honeymoon-special",
    duration: "7D/6N",
    price: 24999,
    featured_image: "",
    location: "Srinagar, Houseboat, Gulmarg, Pahalgam",
    description: "Romantic getaway for couples with special candlelight dinner and flower decoration.",
    inclusions: ["Honeymoon Suite", "Candlelight Dinner", "Flower Bed Decoration", "Private Shikara Ride", "Cake"],
    exclusions: ["Flights", "Personal Expenses", "Adventure Activities"],
    itinerary: [
      { day: 1, title: "Welcome", desc: "Arrival and Houseboat check-in." },
      { day: 2, title: "Romantic Srinagar", desc: "Mughal Gardens and photo shoot." },
      { day: 3, title: "Gulmarg", desc: "Day trip to Gulmarg." },
      { day: 4, title: "Pahalgam", desc: "Overnight in Pahalgam." },
      { day: 5, title: "Pahalgam Leisure", desc: "Leisure day in Pahalgam." },
      { day: 6, title: "Back to Srinagar", desc: "Shopping and relaxing." },
      { day: 7, title: "Goodbye", desc: "Departure." }
    ],
    is_popular: false
  },
  {
    id: "5",
    title: "Budget Kashmir",
    slug: "budget-kashmir",
    duration: "4D/3N",
    price: 9999,
    featured_image: "",
    location: "Srinagar, Gulmarg",
    description: "Pocket-friendly tour covering the essentials of Kashmir.",
    inclusions: ["Budget Hotels", "Breakfast", "Sharing Transport"],
    exclusions: ["Lunch", "Dinner", "Entry Fees"],
    itinerary: [
      { day: 1, title: "Arrival", desc: "Srinagar arrival." },
      { day: 2, title: "Gulmarg", desc: "Day trip to Gulmarg." },
      { day: 3, title: "Srinagar Sightseeing", desc: "Local sightseeing." },
      { day: 4, title: "Departure", desc: "Airport drop." }
    ],
    is_popular: false
  },
  {
    id: "6",
    title: "Luxury Escape",
    slug: "luxury-escape",
    duration: "6D/5N",
    price: 35000,
    featured_image: "",
    location: "Srinagar, Pahalgam, Sonmarg",
    description: "Stay in 5-star properties and travel in luxury SUVs.",
    inclusions: ["5-Star Hotels", "All Meals", "Luxury SUV", "Guide", "VIP Darshan"],
    exclusions: ["Flights", "Tips"],
    itinerary: [
      { day: 1, title: "Royal Welcome", "desc": "Welcome drink and 5-star check-in." },
      { day: 2, title: "Sonmarg Luxury", "desc": "Private tour of Sonmarg." },
      { day: 3, title: "Pahalgam Retreat", "desc": "Stay at a luxury resort in Pahalgam." },
      { day: 4, title: "Pahalgam Leisure", "desc": "Golfing or relaxing." },
      { day: 5, title: "Srinagar Grandeur", "desc": "Grand houseboat stay." },
      { day: 6, title: "Departure", "desc": "VIP airport drop." }
    ],
    is_popular: false
  }
];
