import Link from "next/link";
import { Sparkles, ArrowRight, Film, Tv, Flame } from "lucide-react";
import { fetchNowPlaying, fetchUpcoming } from "@/lib/tmdb";
import { getWatchlist } from "@/app/actions/watchlist";
import MovieCarousel from "@/components/MovieCarousel";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 3600; // Revalidate page every hour

export default async function Home() {
  const { userId } = await auth();
  
  // Parallel fetch theatrical now playing and upcoming releases
  const [nowPlaying, upcoming] = await Promise.all([
    fetchNowPlaying(),
    fetchUpcoming(),
  ]);

  // Fetch user saved list to show initial checklist values
  let savedIds: number[] = [];
  if (userId) {
    const watchlist = await getWatchlist();
    savedIds = watchlist.map((item: any) => item.tmdbId);
  }

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 md:px-8 border-b border-white/5 bg-radial from-red-950/20 via-[#08090c] to-[#08090c]">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[250px] md:h-[400px] bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-black tracking-wider uppercase mb-6 animate-pulse">
            <Sparkles size={12} className="fill-orange-400/20" /> Next-Gen AI Curation
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.05] max-w-3xl">
            Match your mood with the <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">perfect vibe</span>.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
            Tell our AI concierge how you're feeling, what you're eating, or how much energy you have. Get real, streamable recommendations instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm">
            <Link
              href="/mood-chat"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-95 text-white font-black text-sm tracking-wider uppercase py-4 px-8 rounded-full shadow-lg transition-all"
            >
              Start Mood Chat <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Browse Lists */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-16">
        {/* Now Playing in Theatres Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-red-500" size={20} />
              <h2 className="text-2xl font-black tracking-tight text-white">
                Now in Theatres
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full">
              Region: India
            </span>
          </div>

          {nowPlaying.length > 0 ? (
            <MovieCarousel movies={nowPlaying} savedIds={savedIds} isTheatrical={true} />
          ) : (
            <div className="h-[250px] flex items-center justify-center rounded-2xl bg-white/5 border border-white/5">
              <p className="text-gray-500 text-sm font-semibold">
                No theatrical movies found or TMDB is offline.
              </p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Film className="text-orange-400" size={20} />
            <h2 className="text-2xl font-black tracking-tight text-white">
              Coming Soon
            </h2>
          </div>

          {upcoming.length > 0 ? (
            <MovieCarousel movies={upcoming} savedIds={savedIds} />
          ) : (
            <div className="h-[250px] flex items-center justify-center rounded-2xl bg-white/5 border border-white/5">
              <p className="text-gray-500 text-sm font-semibold">
                No upcoming releases found or TMDB is offline.
              </p>
            </div>
          )}
        </section>

        {/* Features Guide Grid */}
        <section className="grid md:grid-cols-3 gap-8 mt-4">
          <div className="p-6 rounded-3xl bg-[#11131a] border border-white/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
              <Flame size={20} />
            </div>
            <h3 className="text-base font-bold text-white">1. Describe Your Mood</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              "Need something light to laugh at while cooking" or "give me a dark, twisted murder mystery." Write freely.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#11131a] border border-white/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-white">2. Narrow Your Preferences</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Answer 1-3 direct follow-ups about your time, energy level, or content type, or skip straight to recommendations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#11131a] border border-white/5 flex flex-col gap-3">
            <div className="h-10 w-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/10">
              <Tv size={20} />
            </div>
            <h3 className="text-base font-bold text-white">3. Get Real Watch Options</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              View real titles matched against TMDB, see what streaming services they are on, and deep link to theatres.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
