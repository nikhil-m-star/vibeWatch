"use client";

import { useState } from "react";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { markAsWatched } from "@/app/actions/history";
import { Plus, Check, Star, Play, X, ExternalLink } from "lucide-react";
import { WatchProvider } from "@/lib/tmdb";

interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  mediaType: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
  providers: WatchProvider[];
}

export default function WatchlistList({ items: initialItems }: { items: WatchlistItem[] }) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  
  // Rating states
  const [activeRatingMovieId, setActiveRatingMovieId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [watchedRecord, setWatchedRecord] = useState<Record<number, boolean>>({});

  const handleRemove = async (item: WatchlistItem) => {
    // Optimistic delete
    setItems((prev) => prev.filter((i) => !(i.tmdbId === item.tmdbId && i.mediaType === item.mediaType)));
    
    try {
      await toggleWatchlist(item.tmdbId, item.title, item.mediaType as "movie" | "tv");
    } catch (err) {
      console.error(err);
      // Revert if error
      setItems(items);
    }
  };

  const handleWatchedClick = (tmdbId: number) => {
    setActiveRatingMovieId(tmdbId);
    setRatingValue(5);
  };

  const handleSaveWatched = async (item: WatchlistItem, ratingOverride?: number | null) => {
    const finalRating = ratingOverride !== undefined ? ratingOverride : ratingValue;
    try {
      await markAsWatched(item.tmdbId, item.title, item.mediaType as "movie" | "tv", finalRating);
      setWatchedRecord((prev) => ({ ...prev, [item.tmdbId]: true }));
      setActiveRatingMovieId(null);
      // Remove from watchlist list since it is now watched
      setItems((prev) => prev.filter((i) => !(i.tmdbId === item.tmdbId && i.mediaType === item.mediaType)));
    } catch (err) {
      console.error(err);
    }
  };

  const getBmsLink = (title: string) => {
    return `https://www.google.com/search?q=bookmyshow+${encodeURIComponent(title)}+tickets`;
  };

  if (items.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#11131a] rounded-3xl border border-white/5">
        <Play size={32} className="text-gray-600 mb-4" />
        <h3 className="text-sm font-bold text-gray-300 mb-1">Your Watchlist is empty</h3>
        <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed">
          Add titles from the home page explore carousels or get personalized AI recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => {
        const posterUrl = item.posterPath
          ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
          : "/placeholder-poster.png";

        const isWatched = !!watchedRecord[item.tmdbId];

        return (
          <div
            key={`${item.mediaType}-${item.tmdbId}`}
            className="group flex flex-col bg-[#11131a] rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors shadow-lg glow-card relative"
          >
            {/* Media Type Overlay */}
            <span className="absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/5 text-gray-300">
              {item.mediaType === "movie" ? "Movie" : "Series"}
            </span>

            {/* Poster aspect */}
            <div className="relative aspect-[2/3] bg-gray-900 border-b border-white/5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Title & Vote Average */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight leading-tight line-clamp-1">
                  {item.title}
                </h3>
                {item.voteAverage > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold bg-black/40 px-1.5 py-0.5 rounded">
                    <Star size={9} className="fill-amber-500" />
                    {item.voteAverage.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Availability details & Actions */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              
              {/* OTT Streaming providers */}
              <div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-2">
                  Streaming availability
                </span>
                {item.providers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.providers.slice(0, 4).map((prov) => (
                      <div
                        key={prov.provider_id}
                        title={prov.provider_name}
                        className="h-6 w-6 rounded-lg overflow-hidden border border-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://image.tmdb.org/t/p/original${prov.logo_path}`}
                          alt={prov.provider_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 italic font-semibold">
                      Not streaming in India
                    </span>
                    <a
                      href={getBmsLink(item.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase text-orange-400 hover:underline flex items-center gap-0.5"
                    >
                      BMS Tickets <ExternalLink size={8} />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                {/* Remove */}
                <button
                  onClick={() => handleRemove(item)}
                  className="cursor-pointer flex-1 flex items-center justify-center text-[10px] font-extrabold uppercase py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
                >
                  Unsave
                </button>

                {/* Watched + Rate */}
                <button
                  onClick={() => handleWatchedClick(item.tmdbId)}
                  disabled={isWatched}
                  className="cursor-pointer flex-1 flex items-center justify-center text-[10px] font-extrabold uppercase py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isWatched ? "Watched" : "Watched"}
                </button>
              </div>
            </div>

            {/* Star Rating Overlay */}
            {activeRatingMovieId === item.tmdbId && (
              <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200">
                <button
                  onClick={() => setActiveRatingMovieId(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
                <h4 className="text-xs font-black uppercase tracking-wider text-white text-center">
                  Rate this title
                </h4>
                
                {/* Stars slider */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="cursor-pointer text-2xl text-amber-500 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={
                          star <= ratingValue
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-600"
                        }
                      />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => handleSaveWatched(item)}
                    className="cursor-pointer flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black uppercase py-2.5 rounded-xl hover:opacity-95 transition-opacity"
                  >
                    Save Rating
                  </button>
                  <button
                    onClick={() => handleSaveWatched(item, null)}
                    className="cursor-pointer flex-1 bg-white/5 border border-white/10 text-gray-300 text-[11px] font-black uppercase py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
