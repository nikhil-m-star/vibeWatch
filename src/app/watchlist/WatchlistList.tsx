"use client";

import { useState } from "react";
import { Plus, Check, Play, X, ExternalLink } from "lucide-react";
import { removeWatchlist } from "@/app/actions/watchlist";
import { useRouter } from "next/navigation";

interface WatchlistListProps {
  items: {
    id: string;
    tmdbId: number;
    title: string;
    mediaType: string;
    posterPath: string | null;
    releaseDate: string | null;
    voteAverage: number;
    providers: { logo_path: string; provider_id: number; provider_name: string }[];
  }[];
}

export default function WatchlistList({ items }: WatchlistListProps) {
  const router = useRouter();
  const [listItems, setListItems] = useState(items);

  const handleRemove = async (item: any) => {
    // Optimistic remove
    setListItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await removeWatchlist(item.id);
      router.refresh();
    } catch (err) {
      console.error(err);
      // rollback
      setListItems(items);
    }
  };

  const getBmsLink = (title: string) => {
    return `https://www.google.com/search?q=bookmyshow+${encodeURIComponent(title)}+tickets`;
  };

  if (listItems.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-[#0d0d0d] rounded-3xl">
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
      {listItems.map((item) => {
        const posterUrl = item.posterPath
          ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
          : "/placeholder-poster.png";

        return (
          <div
            key={`${item.mediaType}-${item.tmdbId}`}
            className="group flex flex-col bg-[#0d0d0d] rounded-3xl overflow-hidden transition-all shadow-lg hover:shadow-2xl relative duration-300 district-card"
          >
            {/* Poster aspect - strict aspect-[2/3] vertical */}
            <div className="relative aspect-[2/3] bg-gray-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Media Type Tag */}
              <span className={`absolute top-3 left-3 z-10 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                item.mediaType === "movie" ? "district-badge-purple" : "district-badge-cyan"
              }`}>
                {item.mediaType === "movie" ? "Movie" : "Series"}
              </span>

              {/* Hover overlay with Unsave control button only */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <button
                  onClick={() => handleRemove(item)}
                  className="cursor-pointer flex-1 flex items-center justify-center text-[10px] font-extrabold uppercase py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white rounded-xl transition-all"
                >
                  Unsave
                </button>
              </div>
            </div>

            {/* Content & Metadata details underneath the image */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-white leading-snug uppercase tracking-wide line-clamp-1">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  <span>{item.releaseDate ? new Date(item.releaseDate).getFullYear() : "TBA"}</span>
                  {item.voteAverage > 0 && (
                    <span className="text-[#a855f7] ml-auto font-black">
                      Score {item.voteAverage.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* OTT Streaming providers */}
              <div className="pt-3 border-t border-white/5">
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
                    <span className="text-[10px] text-gray-500 font-semibold">
                      Not streaming in India
                    </span>
                    <a
                      href={getBmsLink(item.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase text-[#a855f7] hover:underline flex items-center gap-0.5"
                    >
                      BMS Tickets <ExternalLink size={8} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
