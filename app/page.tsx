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

  // No fallback to mock data
  const displayEvents = events || [];
  const isDemo = false;

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
