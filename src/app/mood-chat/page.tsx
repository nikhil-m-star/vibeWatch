"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/app/actions/chat";
import { toggleWatchlist, isTitleSaved } from "@/app/actions/watchlist";
import { markAsWatched } from "@/app/actions/history";
import { getProvidersAction } from "@/app/actions/tmdb";
import { ChatMessage } from "@/lib/nim";
import { WatchProvider } from "@/lib/tmdb";
import { 
  Sparkles, Check, Star, 
  Loader2, ArrowUp, X, ExternalLink, RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MoodChatPage() {
  const router = useRouter();
  const [queryId, setQueryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Recommendations state
  const [isReady, setIsReady] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [providers, setProviders] = useState<Record<number, WatchProvider[]>>({});
  const [savedIds, setSavedIds] = useState<Record<number, boolean>>({});
  
  // Rating states
  const [activeRatingMovieId, setActiveRatingMovieId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [watchedRecord, setWatchedRecord] = useState<Record<number, boolean>>({});

  // Derive latest messages for the floating pill
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || null;
  const lastAiMsg = [...messages].reverse().find((m) => m.role === "assistant")?.content || null;

  // Load watch providers and saved states when recommendations load
  useEffect(() => {
    if (recommendations.length > 0) {
      recommendations.forEach(async (rec) => {
        const providersList = await getProvidersAction(rec.tmdbId, rec.mediaType);
        setProviders((prev) => ({ ...prev, [rec.tmdbId]: providersList }));
        
        const saved = await isTitleSaved(rec.tmdbId, rec.mediaType);
        setSavedIds((prev) => ({ ...prev, [rec.tmdbId]: saved }));
      });
    }
  }, [recommendations]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInputText("");
    
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(queryId, text);
      setQueryId(res.queryId);
      setMessages(res.conversation);
      
      if (res.readyToRecommend) {
        setIsReady(true);
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Here are some picks for you." }
      ]);
      setIsReady(true);
      setRecommendations([
        { tmdbId: 27205, title: "Inception", mediaType: "movie", posterPath: "/o0Qywl1ILK75h0uz2gfwH6D7c5C.jpg", reason: "A mind-bending masterpiece." },
        { tmdbId: 155, title: "The Dark Knight", mediaType: "movie", posterPath: "/qJ2tWw3pmIv3gh7pb2uC0nSdqK1.jpg", reason: "An epic crime thriller." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWatchlist = async (rec: any) => {
    const prev = !!savedIds[rec.tmdbId];
    setSavedIds((prevMap) => ({ ...prevMap, [rec.tmdbId]: !prev }));
    
    try {
      const saved = await toggleWatchlist(rec.tmdbId, rec.title, rec.mediaType);
      setSavedIds((prevMap) => ({ ...prevMap, [rec.tmdbId]: saved }));
    } catch (err) {
      console.error(err);
      setSavedIds((prevMap) => ({ ...prevMap, [rec.tmdbId]: prev }));
    }
  };

  const handleWatchedClick = (tmdbId: number) => {
    setActiveRatingMovieId(tmdbId);
    setRatingValue(5);
  };

  const handleSaveWatched = async (rec: any) => {
    try {
      await markAsWatched(rec.tmdbId, rec.title, rec.mediaType, ratingValue);
      setWatchedRecord((prev) => ({ ...prev, [rec.tmdbId]: true }));
      setActiveRatingMovieId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startNewSession = () => {
    setQueryId(null);
    setMessages([]);
    setIsReady(false);
    setRecommendations([]);
    setProviders({});
    setSavedIds({});
    setWatchedRecord({});
  };

  // Preset chips for the empty state
  const presets = [
    "Something light & fun",
    "Emotional drama to cry",
    "Fast-paced thriller",
    "Background noise for studying",
    "Dark spiderman series",
    "Mind-bending sci-fi"
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-68px)] overflow-hidden relative bg-[#07080c]">
      {/* Full-Page Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-32">
        {!isReady && !isLoading && messages.length === 0 ? (
          /* ===== EMPTY STATE: centered prompt ===== */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#e23744]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6 max-w-md">
              <div className="flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e23744] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Concierge</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What's your <span className="text-[#ff4d5d]">vibe</span> today?
              </h1>

              <div className="flex flex-wrap gap-2 justify-center">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setInputText(preset);
                      handleSendMessage(preset);
                    }}
                    className="cursor-pointer text-[10px] font-semibold text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-full px-4 py-2 transition-all duration-200"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !isReady ? (
          /* ===== PROCESSING STATE: show user query + AI thinking ===== */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#e23744]/5 rounded-full blur-[90px] pointer-events-none" />
            
            <div className="relative z-10 space-y-5 max-w-sm">
              {lastUserMsg && (
                <div className="bg-white/[0.03] rounded-2xl p-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block mb-2">Your vibe</span>
                  <p className="text-sm text-white font-semibold leading-relaxed">{lastUserMsg}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center gap-2.5 py-3">
                  <Loader2 size={14} className="animate-spin text-[#ff4d5d]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Finding your matches...</span>
                </div>
              ) : lastAiMsg ? (
                <div className="bg-white/[0.03] rounded-2xl p-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#ff4d5d] block mb-2">AI Response</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{lastAiMsg}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* ===== RESULTS STATE: recommendation grid ===== */
          <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between pb-4">
              <h1 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Sparkles size={14} className="text-[#ff4d5d]" />
                VIBE RESULTS
              </h1>
              <button
                onClick={startNewSession}
                className="cursor-pointer flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-extrabold text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02]"
              >
                <RotateCcw size={10} />
                New Search
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const isSaved = !!savedIds[rec.tmdbId];
                const isWatched = !!watchedRecord[rec.tmdbId];
                const recProviders = providers[rec.tmdbId] || [];

                return (
                  <div
                    key={rec.id || rec.tmdbId}
                    className="group flex flex-col bg-[#11131a] rounded-[28px] overflow-hidden transition-all shadow-lg hover:shadow-2xl relative duration-300 district-card"
                  >
                    {/* Media Type Tag */}
                    <span className={`absolute top-3.5 left-3.5 z-10 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      rec.mediaType === "movie" ? "district-badge-red" : "district-badge-cyan"
                    }`}>
                      {rec.mediaType === "movie" ? "Movie" : "TV Show"}
                    </span>

                    {/* Poster */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          rec.posterPath
                            ? `https://image.tmdb.org/t/p/w500${rec.posterPath}`
                            : "/placeholder-poster.png"
                        }
                        alt={rec.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                      
                      <div className="absolute bottom-3.5 left-3.5 right-3.5">
                        <h3 className="text-sm font-black text-white leading-snug uppercase">
                          {rec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <p className="text-[11px] text-gray-300 leading-relaxed font-semibold italic bg-white/[0.02] p-3.5 rounded-xl">
                        {rec.reason}
                      </p>

                      {recProviders.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[8px] text-gray-500 font-extrabold uppercase mr-1">Streaming:</span>
                          {recProviders.slice(0, 4).map((provider) => (
                            <img
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="h-5 w-5 rounded object-cover bg-black/30 transition-transform hover:scale-110"
                            />
                          ))}
                        </div>
                      )}

                      {/* Controls */}
                      <div className="pt-3.5 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleWatchlist(rec)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-secondary hover:scale-[1.02] transition-transform"
                          >
                            {isSaved ? (
                              <>Saved <Check size={10} className="text-emerald-400" /></>
                            ) : (
                              <>Save</>
                            )}
                          </button>

                          <button
                            onClick={() => handleWatchedClick(rec.tmdbId)}
                            disabled={isWatched}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-secondary text-[#ff4d5d] disabled:opacity-40 hover:scale-[1.02] transition-transform"
                          >
                            {isWatched ? "Watched" : "Rate"}
                          </button>
                        </div>

                        {rec.mediaType === "movie" && (
                          <a
                            href={`https://www.google.com/search?q=bookmyshow+${encodeURIComponent(rec.title)}+tickets`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-primary bg-gradient-to-r from-[#e23744] to-[#ff4d5d] text-white shadow-lg shadow-[#e23744]/20 hover:scale-[1.02] transition-all"
                          >
                            Tickets <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Star Rating Overlay */}
                    {activeRatingMovieId === rec.tmdbId && (
                      <div className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200">
                        <button
                          onClick={() => setActiveRatingMovieId(null)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-white text-center">
                          Rate this title
                        </h4>
                        
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingValue(star)}
                              className="cursor-pointer text-xl text-amber-500 focus:outline-none"
                            >
                              <Star
                                size={20}
                                className={
                                  star <= ratingValue
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-gray-700"
                                }
                              />
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 w-full pt-2">
                          <button
                            onClick={() => handleSaveWatched(rec)}
                            className="cursor-pointer flex-1 py-2 text-[9px] district-btn-primary shadow-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleSaveWatched({ ...rec, ratingValue: null })}
                            className="cursor-pointer flex-1 py-2 text-[9px] district-btn-secondary"
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
          </div>
        )}
      </div>

      {/* ===== FLOATING BOTTOM PILL ===== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#11131a]/90 backdrop-blur-2xl rounded-full px-4 py-2.5 shadow-2xl shadow-black/50"
        >
          {/* Reset button (only when there's an active session) */}
          {(messages.length > 0 || isReady) && (
            <button
              type="button"
              onClick={startNewSession}
              className="cursor-pointer h-8 w-8 flex-none flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="New chat"
            >
              <RotateCcw size={13} />
            </button>
          )}

          <input
            type="text"
            disabled={isLoading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isReady ? "Ask for something else..." : "Describe your vibe..."}
            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 py-1"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="cursor-pointer h-8 w-8 flex-none flex items-center justify-center rounded-full bg-gradient-to-r from-[#e23744] to-[#ff4d5d] text-white disabled:opacity-25 disabled:pointer-events-none transition-all shadow-lg shadow-[#e23744]/20 hover:scale-105"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
