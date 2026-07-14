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
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Banner Section (District-Style Event Card Banner) */}
      <section className="relative px-4 md:px-8 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-[#161a26] via-[#0e1017] to-[#090a0f] p-8 md:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 min-h-[380px]">
            {/* Background glowing circles */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#e23744]/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-xl relative z-10 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-wider text-[#ff4d5d] mb-6">
                <Sparkles size={12} className="fill-[#ff4d5d]/20" /> AI-Powered Curation
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.05]">
                Discover entertainment that fits <span className="text-[#ff4d5d]">your exact vibe</span>.
              </h1>

              <p className="text-gray-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
                Skip the endless browsing. Tell our AI concierge how you're feeling, what you're eating, or your energy level. Get real, streamable recommendations instantly.
              </p>

              <Link
                href="/mood-chat"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 district-btn-primary shadow-lg shadow-[#e23744]/20 hover:shadow-[#e23744]/30"
              >
                Start Mood Chat <ArrowRight size={16} />
              </Link>
            </div>

            {/* Featured Event Card Visual */}
            <div className="w-full md:w-2/5 max-w-[340px] aspect-[4/3] rounded-[24px] bg-[#12141c]/80 border border-white/5 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm self-stretch md:self-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#e23744]/5 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="district-badge-red px-2.5 py-1 rounded-full">Trending Vibe</span>
                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">01 // CONCIERGE</span>
              </div>
              <div>
                <p className="text-sm font-semibold italic text-gray-300 mb-2 leading-relaxed">
                  "Give me a dark, twisted psychological mystery that starts slow but speeds up at the end..."
                </p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  — User search query
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 pt-4 text-xs font-bold text-[#ff4d5d]">
                <Sparkles size={14} /> Matching top cult releases...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar (District-Style Browsing Filter) */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scrollbar-none py-2">
          <span className="district-pill-active px-5 py-2 text-xs cursor-pointer flex-none">
            All Listings
          </span>
          <a href="#theatres" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            In Theatres Now
          </a>
          <a href="#upcoming" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            Upcoming Releases
          </a>
          <Link href="/mood-chat" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none border-dashed border-[#e23744]/40 hover:border-[#e23744] text-white">
            ⚡ AI Vibe Chat
          </Link>
        </div>
      </section>

      {/* Main Browse Lists */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-14">
        {/* Now Playing in Theatres Section */}
        <section id="theatres" className="flex flex-col gap-5 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#e23744]/10 border border-[#e23744]/20 flex items-center justify-center text-[#ff4d5d]">
                <Flame size={16} />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Now in Theatres
              </h2>
            </div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full">
              Region: India
            </span>
          </div>

          {nowPlaying.length > 0 ? (
            <MovieCarousel movies={nowPlaying} savedIds={savedIds} isTheatrical={true} />
          ) : (
            <div className="h-[250px] flex items-center justify-center rounded-[24px] bg-[#12141c] border border-white/5">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No theatrical movies found or TMDB is offline.
              </p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        <section id="upcoming" className="flex flex-col gap-5 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Film size={16} />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Upcoming Releases
              </h2>
            </div>
          </div>

          {upcoming.length > 0 ? (
            <MovieCarousel movies={upcoming} savedIds={savedIds} />
          ) : (
            <div className="h-[250px] flex items-center justify-center rounded-[24px] bg-[#12141c] border border-white/5">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No upcoming releases found or TMDB is offline.
              </p>
            </div>
          )}
        </section>

        {/* Features Guide Grid */}
        <section className="grid md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
          <div className="p-6 rounded-[24px] bg-[#12141c] border border-white/5 flex flex-col gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#e23744]/10 flex items-center justify-center text-[#ff4d5d] border border-[#e23744]/15">
              <Flame size={18} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">1. Describe Your Mood</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              "Need something light to laugh at while cooking" or "give me a dark, twisted murder mystery." Write freely to the AI concierge.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#12141c] border border-white/5 flex flex-col gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15">
              <Sparkles size={18} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">2. Refine Your Match</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              Answer 1-3 simple follow-ups about your timeframe, energy, or content preference, or skip questions to recommend instantly.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#12141c] border border-white/5 flex flex-col gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/15">
              <Tv size={18} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">3. Stream Immediately</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              See what major OTT platform (Netflix, Hotstar, Prime) the title is streaming on, or click to book tickets for in-theatre shows.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
