import { getWatchlist } from "@/app/actions/watchlist";
import { fetchTitleDetails, fetchWatchProviders } from "@/lib/tmdb";
import WatchlistList from "./WatchlistList";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const saved = await getWatchlist();
  
  // Resolve poster details and streaming availability for all watchlist items in parallel
  const detailedWatchlist = await Promise.all(
    saved.map(async (item) => {
      const tmdbMeta = await fetchTitleDetails(item.tmdbId, item.mediaType as "movie" | "tv");
      const providers = await fetchWatchProviders(item.tmdbId, item.mediaType as "movie" | "tv");
      return {
        id: item.id,
        tmdbId: item.tmdbId,
        title: item.title,
        mediaType: item.mediaType,
        posterPath: tmdbMeta?.poster_path || null,
        releaseDate: tmdbMeta?.release_date || null,
        voteAverage: tmdbMeta?.vote_average || 0,
        providers,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1">
      {/* Title Header */}
      <div className="border-b border-white/5 pb-6 mb-8">
        <span className="text-[10px] uppercase font-extrabold tracking-widest bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          My Collection
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white mt-1">
          Your Watchlist
        </h1>
      </div>

      {/* Render the interactive list */}
      <WatchlistList items={detailedWatchlist} />
    </div>
  );
}
