"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage, getReplacementRecommendation } from "@/app/actions/chat";
import { toggleWatchlist, isTitleSaved } from "@/app/actions/watchlist";
import { markAsWatched } from "@/app/actions/history";
import { getProvidersAction, getTrendingPosterPaths } from "@/app/actions/tmdb";
import { ChatMessage } from "@/lib/nim";
import { WatchProvider } from "@/lib/tmdb";
import { 
  Compass, Check, Loader2, ArrowUp, ExternalLink, RotateCcw, Eye, Laugh, BookOpen, Shield, Film, Flame, Tv, Clapperboard, Ticket
} from "lucide-react";
import { useRouter } from "next/navigation";

const loadingPosters = [
  "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmAAgqHgNAVt7lOIHi.jpg",
  "https://image.tmdb.org/t/p/w500/8cdWjv4cZaEUTMclKA5aLEz51fR.jpg",
  "https://image.tmdb.org/t/p/w500/wWba30VFTilV2814vRBEJy6STlh.jpg",
  "https://image.tmdb.org/t/p/w500/czemb421NaKzX7IN4VlQizLVy2C.jpg",
  "https://image.tmdb.org/t/p/w500/oM6gJ7A57l2Pt2hXNuJpBTpUI6C.jpg",
  "https://image.tmdb.org/t/p/w500/yrp1547fyjj56n1f56s9n9Xzs9b.jpg",
  "https://image.tmdb.org/t/p/w500/iADOOC62nwjoPL6Bo4vyFBTCKy2.jpg",
  "https://image.tmdb.org/t/p/w500/pExEnmgiej7uMo0946200ZgUgkI.jpg"
];

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
  const [cardLoading, setCardLoading] = useState<Record<number, boolean>>({});
  
  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingActiveIndex, setLoadingActiveIndex] = useState(0);
  const [trendingPosters, setTrendingPosters] = useState<string[]>([]);

  // Load live trending posters from TMDB on client mount
  useEffect(() => {
    getTrendingPosterPaths().then((paths) => {
      if (paths && paths.length > 0) {
        setTrendingPosters(paths);
      }
    });
  }, []);

  const activePosters = trendingPosters.length > 0 ? trendingPosters : loadingPosters;

  // Rotate loading posters ribbon while AI query is executing (smooth right-to-left shift)
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingActiveIndex((prev) => (prev + 1) % activePosters.length);
      }, 850);
    }
    return () => clearInterval(interval);
  }, [isLoading, activePosters.length]);

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

  // Load chat session state from localStorage on client-side mount
  useEffect(() => {
    const savedSession = localStorage.getItem("vibe_watch_chat_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.queryId) setQueryId(parsed.queryId);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.isReady !== undefined) setIsReady(parsed.isReady);
        if (parsed.recommendations) setRecommendations(parsed.recommendations);
      } catch (err) {
        console.error("Failed to restore chat session:", err);
      }
    }
  }, []);

  // Save chat session state to localStorage when values change
  useEffect(() => {
    if (messages.length > 0 || isReady) {
      const sessionData = {
        queryId,
        messages,
        isReady,
        recommendations,
      };
      localStorage.setItem("vibe_watch_chat_session", JSON.stringify(sessionData));
    }
  }, [queryId, messages, isReady, recommendations]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInputText("");
    setErrorMessage(null);
    
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(queryId, text);
      
      // Check if response contains a rate-limiting message or general error
      if ((res as any).error) {
        setErrorMessage((res as any).message || "Something went wrong.");
        setIsLoading(false);
        return;
      }

      setQueryId(res.queryId);
      setMessages(res.conversation);
      
      if (res.readyToRecommend) {
        setIsReady(true);
        setRecommendations(res.recommendations);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Too many requests. Please try again in a minute.");
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

  const handleMarkAsWatched = async (rec: any) => {
    if (!queryId) return;
    setCardLoading((prev) => ({ ...prev, [rec.tmdbId]: true }));
    setErrorMessage(null);

    try {
      // 1. Save to database watch history (null rating)
      await markAsWatched(rec.tmdbId, rec.title, rec.mediaType, null);

      // 2. Fetch replacement suggestion
      const currentTitles = recommendations.map((r) => r.title);
      const replacement = await getReplacementRecommendation(queryId, currentTitles);

      // 3. Swap the card in recommendations list
      setRecommendations((prev) => 
        prev.map((r) => r.tmdbId === rec.tmdbId ? {
          id: replacement.id,
          tmdbId: replacement.tmdbId,
          title: replacement.title,
          mediaType: replacement.mediaType,
          posterPath: replacement.posterPath,
          reason: replacement.reason,
        } : r)
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to replace card suggestion. Try again.");
    } finally {
      setCardLoading((prev) => ({ ...prev, [rec.tmdbId]: false }));
    }
  };

  const startNewSession = () => {
    setQueryId(null);
    setMessages([]);
    setIsReady(false);
    setRecommendations([]);
    setProviders({});
    setSavedIds({});
    setErrorMessage(null);
    localStorage.removeItem("vibe_watch_chat_session");
  };

  // Preset chips for the empty state with unique playful styles
  const presets = [
    { text: "Something light and fun", icon: Laugh, hoverBg: "hover:bg-amber-400 hover:text-black", rotateClass: "hover:rotate-1" },
    { text: "Emotional drama to watch", icon: Film, hoverBg: "hover:bg-rose-500 hover:text-white", rotateClass: "hover:-rotate-2" },
    { text: "Fast-paced thriller", icon: Compass, hoverBg: "hover:bg-orange-500 hover:text-white", rotateClass: "hover:rotate-2" },
    { text: "Background noise for studying", icon: BookOpen, hoverBg: "hover:bg-teal-400 hover:text-black", rotateClass: "hover:-rotate-1" },
    { text: "Dark superhero series", icon: Shield, hoverBg: "hover:bg-indigo-500 hover:text-white", rotateClass: "hover:rotate-1" },
    { text: "Mind-bending sci-fi", icon: Compass, hoverBg: "hover:bg-lime-400 hover:text-black", rotateClass: "hover:-rotate-2" }
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-68px)] overflow-hidden relative bg-black">
      {/* Full-Page Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-32">
        {!isReady && !isLoading && messages.length === 0 ? (
          /* ===== EMPTY STATE: centered prompt ===== */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#a855f7]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 space-y-8 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                What is your <span className="text-[#a855f7]">vibe</span> today?
              </h1>

              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.text}
                      onClick={() => {
                        setInputText(preset.text);
                        handleSendMessage(preset.text);
                      }}
                      className={`cursor-pointer flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0d0d0d] text-gray-300 font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.05] shadow-lg shadow-black/40 ${preset.hoverBg} ${preset.rotateClass}`}
                    >
                      <Icon size={14} className="text-[#a855f7] group-hover:text-inherit flex-shrink-0" />
                      <span>{preset.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : !isReady ? (
          /* ===== PROCESSING STATE: show user query + AI thinking ===== */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#a855f7]/5 rounded-full blur-[90px] pointer-events-none" />
            
            <div className={`relative z-10 space-y-6 transition-all duration-500 w-full ${isLoading ? "max-w-2xl" : "max-w-md"}`}>
              {lastUserMsg && (
                <div className="bg-white/[0.03] rounded-2xl p-5 text-left mx-auto max-w-md">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block mb-2">Your vibe</span>
                  <p className="text-base sm:text-lg text-white font-black leading-relaxed">{lastUserMsg}</p>
                </div>
              )}

              {isLoading ? (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
                  {/* Cinematic smooth ribbon stretching edge-to-edge across screen */}
                  <div className="w-screen h-[300px] md:h-[480px] relative overflow-hidden flex items-center justify-center">
                    {activePosters.map((poster, index) => {
                      // Calculate circular loop distance relative to active index
                      let diff = index - loadingActiveIndex;
                      const len = activePosters.length;
                      
                      if (diff < -len / 2) diff += len;
                      if (diff > len / 2) diff -= len;
                      
                      const isVisible = Math.abs(diff) <= 3;
                      
                      // Map diff to hardware-accelerated transform scale and opacity
                      let scale = 0.52;
                      let opacity = 0;
                      let zIndex = 0;
                      
                      if (isVisible) {
                        if (diff === 0) {
                          scale = 1.28;
                          opacity = 1;
                          zIndex = 30;
                        } else if (Math.abs(diff) === 1) {
                          scale = 0.90;
                          opacity = 0.75;
                          zIndex = 20;
                        } else if (Math.abs(diff) === 2) {
                          scale = 0.65;
                          opacity = 0.45;
                          zIndex = 10;
                        } else {
                          scale = 0.45;
                          opacity = 0.20;
                          zIndex = 0;
                        }
                      }
                      
                      return (
                        <div
                          key={index}
                          style={{
                            transform: `translate3d(calc(-50% + ${diff * 22}vw), -50%, 0) scale(${scale})`,
                            opacity: opacity,
                            zIndex: zIndex,
                          }}
                          className="absolute left-1/2 top-1/2 w-32 h-48 md:w-52 md:h-78 rounded-2xl overflow-hidden bg-[#0d0d0d] shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-[850ms] ease-in-out transform-gpu flex-none"
                        >
                          <img
                            src={poster}
                            alt="Vibe match loading"
                            className="w-full h-full object-cover pointer-events-none select-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Clean small loading text at the bottom */}
                  <div className="mt-8 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-[#a855f7]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] animate-pulse">
                      Finding your matches
                    </span>
                  </div>
                </div>
              ) : lastAiMsg ? (
                <div className="bg-white/[0.03] rounded-2xl p-5 text-left mx-auto max-w-md">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#a855f7] block mb-2">AI Response</span>
                  <p className="text-sm text-gray-200 leading-relaxed font-semibold">{lastAiMsg}</p>
                </div>
              ) : null}

              {errorMessage && (
                <div className="bg-red-500/10 border-l-2 border-red-500 rounded-lg p-3 text-left">
                  <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
                </div>
              )}

              {/* Reset Chat button to return to empty presets state */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={startNewSession}
                  className="cursor-pointer flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-extrabold text-[9px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02]"
                >
                  <RotateCcw size={10} />
                  Reset Chat
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ===== RESULTS STATE: recommendation grid ===== */
          <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between pb-4">
              <h1 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Compass size={14} className="text-[#a855f7]" />
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

            {/* Cards Grid with Vertical Rectangle aspect ratios and text underneath */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const isSaved = !!savedIds[rec.tmdbId];
                const recProviders = providers[rec.tmdbId] || [];
                const isLoadingCard = !!cardLoading[rec.tmdbId];

                if (isLoadingCard) {
                  return (
                    <div
                      key={rec.id || rec.tmdbId}
                      className="flex flex-col gap-3 animate-pulse"
                    >
                      {/* Vertical Poster Skeleton */}
                      <div className="aspect-[2/3] w-full rounded-[24px] bg-[#0d0d0d]"></div>
                      
                      {/* Metadata Skeleton */}
                      <div className="space-y-2 mt-1">
                        <div className="h-4 bg-[#0d0d0d] rounded-md w-3/4" />
                        <div className="h-10 bg-[#0d0d0d] rounded-xl w-full" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={rec.id || rec.tmdbId}
                    className="group flex flex-col snap-start cursor-pointer"
                  >
                    {/* Poster Container - strictly vertical aspect-[2/3] */}
                    <div className="relative aspect-[2/3] w-full rounded-[24px] overflow-hidden bg-[#0d0d0d] district-card">
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

                      {/* Bottom action drawer on hover, leaving the poster visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 rounded-b-[24px]">
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleToggleWatchlist(rec)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-secondary"
                          >
                            {isSaved ? (
                              <>Saved <Check size={10} className="text-[#a855f7]" /></>
                            ) : (
                              <>Save</>
                            )}
                          </button>

                          <button
                            onClick={() => handleMarkAsWatched(rec)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-secondary text-gray-300 hover:text-white"
                          >
                            Watched <Eye size={10} />
                          </button>
                        </div>

                        {rec.mediaType === "movie" && (
                          <a
                            href={`https://www.google.com/search?q=bookmyshow+${encodeURIComponent(rec.title)}+tickets`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[9px] district-btn-primary bg-[#a855f7] hover:bg-[#b55fe6] text-white shadow-lg shadow-[#a855f7]/25"
                          >
                            Tickets <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Metadata details underneath the image */}
                    <div className="mt-3.5 px-1 space-y-2">
                      <h3 className="text-sm font-black text-white leading-snug uppercase tracking-wide">
                        {rec.title}
                      </h3>
                      
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-semibold bg-[#0d0d0d] p-4 rounded-2xl">
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
                              className="h-5 w-5 rounded object-contain bg-black/30 transition-transform hover:scale-110"
                            />
                          ))}
                        </div>
                      )}
                    </div>
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
          className="flex items-center gap-2 bg-[#11131a]/95 backdrop-blur-2xl rounded-full px-4 py-2.5 shadow-2xl shadow-black/50"
        >
          {/* Reset button */}
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
            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 py-1 font-semibold"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="cursor-pointer h-8 w-8 flex-none flex items-center justify-center rounded-full bg-[#a855f7] hover:bg-[#b55fe6] text-white disabled:opacity-25 disabled:pointer-events-none transition-all shadow-lg shadow-[#a855f7]/20 hover:scale-105"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
