import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventExplorer } from "@/components/home/event-explorer";
import { HeroSection } from "@/components/home/hero-section";
import { AtmosphereBackground } from "@/components/ui/atmosphere-background";

// Helper to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Date TBD";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}


const FILTER_CATEGORIES = ["All", "Arts & Crafts", "Food & Drink", "Sports & Wellness", "Social & Games", "Language Exchange"];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { q } = await searchParams;

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

      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
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
        <EventExplorer
          initialEvents={displayEvents}
          isDemo={isDemo}
          wishlistEventIds={wishlistEventIds}
        />
      </main>
      <Footer />
    </div>
  );
}
