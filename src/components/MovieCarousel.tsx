"use client";

import { useState } from "react";
import { TMDBMovie } from "@/lib/tmdb";
import { Plus, Check, ExternalLink, Calendar, Star, Info, X } from "lucide-react";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface MovieCarouselProps {
  movies: TMDBMovie[];
  savedIds: number[];
  isTheatrical?: boolean;
}

export default function MovieCarousel({ movies, savedIds, isTheatrical = false }: MovieCarouselProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [localSaved, setLocalSaved] = useState<Record<number, boolean>>(
    movies.reduce((acc, movie) => {
      acc[movie.id] = savedIds.includes(movie.id);
      return acc;
    }, {} as Record<number, boolean>)
  );
  
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const handleFollowToggle = async (movie: TMDBMovie, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const prev = localSaved[movie.id];
    setLocalSaved((prevMap) => ({ ...prevMap, [movie.id]: !prev }));

    try {
      const saved = await toggleWatchlist(movie.id, movie.title, movie.media_type);
      setLocalSaved((prevMap) => ({ ...prevMap, [movie.id]: saved }));
    } catch (err) {
      console.error(err);
      setLocalSaved((prevMap) => ({ ...prevMap, [movie.id]: prev }));
    }
  };

  const getBmsLink = (title: string) => {
    return `https://www.google.com/search?q=bookmyshow+${encodeURIComponent(title)}+tickets`;
  };

  return (
    <div className="relative group">
      {/* Horizontal Scroll Carousel */}
      <div className="flex gap-6 overflow-x-auto scrollbar-none pb-6 snap-x snap-mandatory px-4 md:px-0">
        {movies.map((movie) => {
          const isSaved = localSaved[movie.id];
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/placeholder-poster.png"; // Fallback if no poster

          return (
            <div
              key={`${movie.media_type}-${movie.id}`}
              onClick={() => setSelectedMovie(movie)}
              className="flex-none w-[180px] md:w-[220px] snap-start cursor-pointer group/card"
            >
              {/* Image Container */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border border-white/5 glow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />

                {/* Hover overlay with button controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex gap-2">
                    {isTheatrical ? (
                      <a
                        href={getBmsLink(movie.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] font-black uppercase bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Tickets <ExternalLink size={10} />
                      </a>
                    ) : (
                      <button
                        onClick={(e) => handleFollowToggle(movie, e)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1 text-[11px] font-black uppercase bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {isSaved ? (
                          <>
                            Saved <Check size={11} />
                          </>
                        ) : (
                          <>
                            Watchlist <Plus size={11} />
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMovie(movie)}
                      className="cursor-pointer p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="mt-3">
                <h3 className="text-sm font-bold tracking-tight text-white line-clamp-1 group-hover/card:text-orange-400 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                  <span className="capitalize">{movie.media_type === "movie" ? "Movie" : "Series"}</span>
                  <span>•</span>
                  {movie.release_date && (
                    <span>{new Date(movie.release_date).getFullYear() || "TBA"}</span>
                  )}
                  {movie.vote_average && movie.vote_average > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-500/90 font-bold ml-auto">
                      <Star size={10} className="fill-amber-500" /> {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#11131a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white border border-white/5 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Poster + details banner */}
            <div className="md:flex">
              {/* Image side */}
              <div className="md:w-2/5 aspect-[2/3] md:aspect-auto md:h-full bg-gray-950 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    selectedMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                      : "/placeholder-poster.png"
                  }
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text side */}
              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-orange-400">
                      {selectedMovie.media_type === "movie" ? "Theatrical Movie" : "TV Series"}
                    </span>
                    {selectedMovie.vote_average && selectedMovie.vote_average > 0 && (
                      <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={12} className="fill-amber-500" />
                        {selectedMovie.vote_average.toFixed(1)} / 10
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight mb-2">
                    {selectedMovie.title}
                  </h2>

                  {selectedMovie.release_date && (
                    <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-4">
                      <Calendar size={13} /> Released/Airing:{" "}
                      {new Date(selectedMovie.release_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-5 md:line-clamp-6">
                    {selectedMovie.overview || "No overview available for this title."}
                  </p>
                </div>

                {/* Footer action buttons */}
                <div className="mt-8 pt-4 border-t border-white/5 flex gap-4">
                  {isTheatrical ? (
                    <a
                      href={getBmsLink(selectedMovie.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Find Showtimes (BookMyShow) <ExternalLink size={14} />
                    </a>
                  ) : (
                    <button
                      onClick={(e) => {
                        handleFollowToggle(selectedMovie, e);
                      }}
                      className="cursor-pointer flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider bg-white text-black py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      {localSaved[selectedMovie.id] ? (
                        <>
                          Saved to Watchlist <Check size={14} />
                        </>
                      ) : (
                        <>
                          Add to Watchlist <Plus size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
