export interface CabPlan {
  name: string;
  description: string;
  duration: string;
  startingFrom: string;
  idealFor: string;
  routes: string[];
  vehicle_type?: string;
}

export const CAB_PLANS: CabPlan[] = [
  {
    name: "Srinagar Local Sightseeing",
    description: "Full-day private cab for Mughal Gardens, Dal Lake, Shankaracharya Temple and local markets.",
    duration: "8 Hours",
    startingFrom: "₹2,200",
    idealFor: "Families, Couples, Friends",
    routes: ["Airport / Hotel Pickup", "Mughal Gardens", "Shankaracharya Temple", "Shopping Drop"],
    vehicle_type: "Sedan/SUV",
  },
  {
    name: "Srinagar – Gulmarg – Srinagar",
    description: "Day trip to Gulmarg with comfortable cab, waiting, and return to Srinagar.",
    duration: "Full Day",
    startingFrom: "₹3,500",
    idealFor: "Snow Lovers, Skiing, Gondola Ride",
    routes: ["Hotel Pickup", "Gulmarg", "View Points", "Back to Srinagar"],
    vehicle_type: "SUV",
  },
  {
    name: "Srinagar – Pahalgam – Srinagar",
    description:
      "Scenic drive along Lidder river with stops at Pampore Saffron Fields and Apple Orchards (seasonal).",
    duration: "Full Day",
    startingFrom: "₹4,200",
    idealFor: "Families & Honeymooners",
    routes: ["Srinagar", "Pampore", "Awantipora", "Pahalgam", "Back to Srinagar"],
    vehicle_type: "SUV",
  },
  {
    name: "Srinagar – Sonmarg – Srinagar",
    description:
      "A beautiful drive along the Sindh river up to Sonmarg with plenty of photography stops.",
    duration: "Full Day",
    startingFrom: "₹4,000",
    idealFor: "Scenic Drives & Day Trips",
    routes: ["Srinagar", "Ganderbal", "Sonmarg", "Back to Srinagar"],
    vehicle_type: "SUV",
  },
  {
    name: "Multi-Day Kashmir Cab (Custom)",
    description:
      "Hire a private cab with driver for your entire Kashmir trip. Ideal for flexible custom itineraries.",
    duration: "3–7 Days",
    startingFrom: "On Request",
    idealFor: "Families, Groups, Long Stays",
    routes: ["Srinagar", "Gulmarg", "Pahalgam", "Sonmarg", "Doodhpathri / Gurez (optional)"],
    vehicle_type: "Sedan/SUV/Tempo",
  },
];


