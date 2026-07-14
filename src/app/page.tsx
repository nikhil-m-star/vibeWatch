import Link from "next/link";
import { ArrowRight, Film, Tv, Flame, TrendingUp, Clock } from "lucide-react";
import { fetchNowPlaying, fetchUpcoming, fetchTrending, fetchRecent } from "@/lib/tmdb";
import { getWatchlist } from "@/app/actions/watchlist";
import MovieCarousel from "@/components/MovieCarousel";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 3600; // Revalidate page every hour

export default async function Home() {
  const { userId } = await auth();
  
  // Parallel fetch theatrical now playing, upcoming, trending, and recent lists
  const [nowPlaying, upcoming, trending, recent] = await Promise.all([
    fetchNowPlaying().catch(() => []),
    fetchUpcoming().catch(() => []),
    fetchTrending().catch(() => []),
    fetchRecent().catch(() => []),
  ]);

  // Fetch user saved list to show initial checklist values
  let savedIds: number[] = [];
  if (userId) {
    const watchlist = await getWatchlist();
    savedIds = watchlist.map((item: any) => item.tmdbId);
  }

  return (
    <div className="flex flex-col gap-10 pb-20 bg-black">
      {/* Hero Section - Clean, Centered Header with no container box */}
      <section className="relative px-4 md:px-8 pt-12 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Discover what matches <span className="text-[#a855f7]">your vibe</span>.
          </h1>

          <Link
            href="/mood-chat"
            className="flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider bg-[#a855f7] hover:bg-[#b55fe6] text-white shadow-lg shadow-[#a855f7]/25 rounded-full transition-all"
          >
            Start Vibe Chat <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scrollbar-none py-1">
          <span className="district-pill-active px-5 py-2 text-xs cursor-pointer flex-none bg-[#a855f7] text-white">
            All Listings
          </span>
          <a href="#trending" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            Trending
          </a>
          <a href="#recent" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            Recent Hits
          </a>
          <a href="#theatres" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            In Theatres
          </a>
          <a href="#upcoming" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none">
            Upcoming
          </a>
          <Link href="/mood-chat" className="district-pill-inactive px-5 py-2 text-xs cursor-pointer flex-none text-white">
            AI Vibe Chat
          </Link>
        </div>
      </section>

      {/* Main Browse Lists */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-12">
        {/* Trending Section */}
        <section id="trending" className="flex flex-col gap-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp size={14} />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Trending Now
              </h2>
            </div>
          </div>

          {trending.length > 0 ? (
            <MovieCarousel movies={trending} savedIds={savedIds} />
          ) : (
            <div className="h-[200px] flex items-center justify-center rounded-[20px] bg-[#0d0d0d]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No trending titles found.
              </p>
            </div>
          )}
        </section>

        {/* Recent Hits Section */}
        <section id="recent" className="flex flex-col gap-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Clock size={14} />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Recent Hits
              </h2>
            </div>
          </div>

          {recent.length > 0 ? (
            <MovieCarousel movies={recent} savedIds={savedIds} />
          ) : (
            <div className="h-[200px] flex items-center justify-center rounded-[20px] bg-[#0d0d0d]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No recent releases found.
              </p>
            </div>
          )}
        </section>

        {/* Now Playing in Theatres Section */}
        <section id="theatres" className="flex flex-col gap-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#a855f7]/10 flex items-center justify-center text-[#c084fc]">
                <Flame size={14} />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Now in Theatres
              </h2>
            </div>
            <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
              India
            </span>
          </div>

          {nowPlaying.length > 0 ? (
            <MovieCarousel movies={nowPlaying} savedIds={savedIds} isTheatrical={true} />
          ) : (
            <div className="h-[200px] flex items-center justify-center rounded-[20px] bg-[#0d0d0d]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No theatrical movies found.
              </p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        <section id="upcoming" className="flex flex-col gap-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Film size={14} />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Upcoming Releases
              </h2>
            </div>
          </div>

          {upcoming.length > 0 ? (
            <MovieCarousel movies={upcoming} savedIds={savedIds} />
          ) : (
            <div className="h-[200px] flex items-center justify-center rounded-[20px] bg-[#0d0d0d]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                No upcoming releases found.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
