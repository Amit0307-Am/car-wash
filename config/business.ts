export type Service = {
  id: string;
  name: string;
  description: string;
  startingPrice: string;
  duration: string;
  includes: string[];
  accent: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  accent: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  service: string;
  review: string;
  date: string;
};

export const business = {
  businessName: "AutoGlow Car Wash",
  phone: "+1 (555) 010-0000",
  whatsapp: "+1 (555) 010-0000",
  address: "Demo Street, Sample City, India (demo)",
  mapsUrl: "https://maps.google.com/?q=AutoGlow+Car+Wash+Sample+City",
  openingHours: "Mon - Sat: 9:00 AM - 7:00 PM (demo schedule)",
  location: "Sample City, India (demo)",
  googleRating: "Demo rating — sample only",
  heroTagline: "Professional car wash, interior cleaning and detailing with easy online slot booking.",
  shortDescription:
    "A premium local car wash and detailing studio focused on convenience, quality care, and a polished finish. Demo website for presentation purposes.",
};

export const services: Service[] = [
  {
    id: "basic-car-wash",
    name: "Basic Car Wash",
    description:
      "Fast exterior wash with tyre shine and a dry finish for everyday freshness.",
    startingPrice: "₹299",
    duration: "45 mins",
    includes: ["Exterior wash", "Tyre cleaning", "Basic drying"],
    accent: "from-amber-400 via-orange-500 to-slate-900",
  },
  {
    id: "premium-car-wash",
    name: "Premium Car Wash",
    description:
      "Deep clean and finishing package for a brighter, more polished look.",
    startingPrice: "₹499",
    duration: "75 mins",
    includes: ["Exterior wash", "Interior vacuum", "Wheel shine", "Final wipe-down"],
    accent: "from-cyan-400 via-blue-500 to-slate-900",
  },
  {
    id: "interior-cleaning",
    name: "Interior Cleaning",
    description:
      "Refresh the cabin with dust removal, dashboard care, and a clean finish.",
    startingPrice: "₹599",
    duration: "60 mins",
    includes: ["Interior vacuum", "Dashboard wipe", "Seat dusting", "Glass cleaning"],
    accent: "from-violet-400 via-fuchsia-500 to-slate-900",
  },
  {
    id: "exterior-detailing",
    name: "Exterior Detailing",
    description:
      "Enhanced paint care and surface finishing for added shine and protection.",
    startingPrice: "₹799",
    duration: "90 mins",
    includes: ["Paint-safe gloss", "Wheel detailing", "Spot-free drying", "Badge wipe"],
    accent: "from-rose-400 via-red-500 to-slate-900",
  },
  {
    id: "full-car-detailing",
    name: "Full Car Detailing",
    description:
      "A complete cleanup and finish for customers who want their vehicle showroom-ready.",
    startingPrice: "₹1,499",
    duration: "2 hrs 30 mins",
    includes: ["Full exterior detailing", "Interior cleaning", "Glass treatment", "Finishing polish"],
    accent: "from-emerald-400 via-teal-500 to-slate-900",
  },
];

export const vehicleTypes = ["Hatchback", "Sedan", "SUV"];

export const bookingDates = [
  "2026-09-13",
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-19",
];

export const bookingSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export const galleryItems: GalleryItem[] = [
  { id: "gallery-1", title: "Car Wash", category: "Exterior", accent: "from-amber-500 to-orange-600" },
  { id: "gallery-2", title: "Interior Cleaning", category: "Cabin", accent: "from-violet-500 to-indigo-600" },
  { id: "gallery-3", title: "Detailing", category: "Finish", accent: "from-cyan-500 to-blue-600" },
  { id: "gallery-4", title: "Before & After", category: "Transformation", accent: "from-rose-500 to-red-600" },
  { id: "gallery-5", title: "Quick Refresh", category: "Maintenance", accent: "from-emerald-500 to-teal-600" },
  { id: "gallery-6", title: "Premium Care", category: "Detailing", accent: "from-slate-500 to-slate-700" },
];

export const reviews: Review[] = [
  {
    id: "review-1",
    name: "Demo Customer 1",
    rating: 5,
    service: "Premium Car Wash",
    review: "Sample customer feedback for presentation use only.",
    date: "Sample review",
  },
  {
    id: "review-2",
    name: "Demo Customer 2",
    rating: 4,
    service: "Interior Cleaning",
    review: "Sample customer feedback for presentation use only.",
    date: "Sample review",
  },
  {
    id: "review-3",
    name: "Demo Customer 3",
    rating: 5,
    service: "Full Car Detailing",
    review: "Sample customer feedback for presentation use only.",
    date: "Sample review",
  },
];
