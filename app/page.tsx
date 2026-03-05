import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventExplorer } from "@/components/home/event-explorer";
import { HeroSection } from "@/components/home/hero-section";
import { AtmosphereBackground } from "@/components/ui/atmosphere-background";
import { Suspense } from "react";
import { ExploreSkeleton } from "@/components/home/explore-skeleton";

// Helper to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}


const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange"];

export default async function Home({ searchParams }: {
  searchParams: Promise<{ q?: string; category?: string; price?: string; date?: string }>
}) {
  const supabase = await createClient();
  const { q, category, price, date } = await searchParams;

  let events = [];
  let wishlistEventIds: string[] = [];

  try {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('start_time', { ascending: true });

      // 1. Text Search
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // 2. Category Filter
      if (category && category !== "All") {
        query = query.eq('category', category);
      }

      // 3. Price Filter
      if (price === "free") {
        query = query.eq('price', 0);
      } else if (price === "under-20") {
        query = query.lt('price', 20);
      }

      // 4. Date Filter
      if (date === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        query = query.gte('start_time', today.toISOString()).lte('start_time', tonight.toISOString());
      } else if (date === "this-weekend") {
        const today = new Date();
        const friday = new Date(today);
        friday.setDate(today.getDate() + (5 - today.getDay())); // Next Friday
        friday.setHours(17, 0, 0, 0);

        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2); // Following Sunday
        sunday.setHours(23, 59, 59, 999);

        query = query.gte('start_time', friday.toISOString()).lte('start_time', sunday.toISOString());
      }

      const { data: eventsData, error: eventsError } = await query;

      if (!eventsError && eventsData) {
        events = eventsData;
      }

      if (user) {
        const { data: wishlistData } = await supabase
          .from('wishlist')
          .select('event_id')
          .eq('user_id', user.id);

        if (wishlistData) {
          wishlistEventIds = wishlistData.map(w => w.event_id);
        }
      }
    }
  } catch (e) {
    // Ignore connection errors for demo mode
  }

  // No fallback to mock data
  const displayEvents = events || [];
  const isDemo = false;



  // ... imports

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans relative">
      <AtmosphereBackground intensity="medium" />
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<ExploreSkeleton />}>
          <EventExplorer
            initialEvents={displayEvents}
            isDemo={isDemo}
            wishlistEventIds={wishlistEventIds}
            mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
