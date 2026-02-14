import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventExplorer } from "@/components/home/event-explorer";

// Helper to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

// Mock Data for Demo / Fallback
const MOCK_EVENTS = [
  {
    id: "demo-1",
    title: "Intro to Wheel Throwing",
    host: "Clay Space Berlin",
    category: "Arts",
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    price: 45,
    city: "Kreuzberg",
    imagePart: "Hands molding clay",
    tags: ["Workshop"],
  },
  {
    id: "demo-2",
    title: "Italian Pasta Masterclass",
    host: "Cucina Maria",
    category: "Food",
    start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    price: 65,
    city: "Mitte",
    imagePart: "Group cooking pasta",
    tags: ["Selling fast"],
  },
  {
    id: "demo-3",
    title: "Morning Flow Yoga",
    host: "Urban Zen",
    category: "Sports",
    start_time: new Date(Date.now() + 259200000).toISOString(),
    price: 15,
    city: "Tempelhof",
    imagePart: "Yoga in park",
    tags: ["Outdoor"],
  },
];

const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange"];

export default async function Home() {
  const supabase = await createClient();

  let events = [];
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('start_time', { ascending: true });

      if (!error && data) {
        events = data;
      }
    }
  } catch (e) {
    // Ignore connection errors for demo mode
  }

  // Fallback to mock data if DB is empty or failed
  const displayEvents = (events && events.length > 0) ? events : MOCK_EVENTS;
  const isDemo = (!events || events.length === 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <EventExplorer initialEvents={displayEvents} isDemo={isDemo} />
      </main>
      <Footer />
    </div>
  );
}
