"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/app/actions/chat";
import { toggleWatchlist, isTitleSaved } from "@/app/actions/watchlist";
import { markAsWatched } from "@/app/actions/history";
import { getProvidersAction } from "@/app/actions/tmdb";
import { ChatMessage } from "@/lib/nim";
import { WatchProvider } from "@/lib/tmdb";
import { 
  Sparkles, Send, Plus, Check, Star, Play, 
  HelpCircle, Tv, Film, Loader2, ArrowRight, X, ExternalLink 
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

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load watch providers and saved states when recommendations load
  useEffect(() => {
    if (recommendations.length > 0) {
      recommendations.forEach(async (rec) => {
        // Fetch providers
        const providersList = await getProvidersAction(rec.tmdbId, rec.mediaType);
        setProviders((prev) => ({ ...prev, [rec.tmdbId]: providersList }));
        
        // Fetch saved status
        const saved = await isTitleSaved(rec.tmdbId, rec.mediaType);
        setSavedIds((prev) => ({ ...prev, [rec.tmdbId]: saved }));
      });
    }
  }, [recommendations]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInputText("");
    
    // Optimistic user bubble
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
      // fallback
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Let's recommend a few generic hits for you." }
      ]);
      setIsReady(true);
      setRecommendations([
        { tmdbId: 27205, title: "Inception", mediaType: "movie", posterPath: "/o0Qywl1ILK75h0uz2gfwH6D7c5C.jpg", reason: "Enjoy this mind-bending masterpiece while the AI server resets." },
        { tmdbId: 155, title: "The Dark Knight", mediaType: "movie", posterPath: "/qJ2tWw3pmIv3gh7pb2uC0nSdqK1.jpg", reason: "An epic superhero crime thriller for high-energy nights." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleSendMessage("Please skip the questions and recommend something now based on my current inputs.");
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
    setRatingValue(5); // Default to 5 stars
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

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-68px)] overflow-hidden">
      {/* LEFT COLUMN: Chat Panel */}
      <div className="w-full md:w-[350px] lg:w-[380px] flex-none border-b md:border-b-0 md:border-r border-white/5 bg-[#0b0c11] flex flex-col h-[40%] md:h-full relative z-20">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-[#12141c] flex items-center justify-between">
          <span className="text-xs font-black tracking-widest text-white uppercase">VIBE CONCIERGE</span>
          {(messages.length > 0 || isReady) && (
            <button 
              onClick={startNewSession}
              className="cursor-pointer text-[9px] uppercase font-black text-gray-400 hover:text-white border border-white/10 px-2.5 py-1 rounded-lg transition-colors bg-white/5"
            >
              Reset
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-[#090a0f]/60">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-6">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">How's your vibe?</h3>
              
              {/* Preset suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                {[
                  "Something light, don't want to think",
                  "Want to cry / emotional drama",
                  "A fast-paced crime thriller",
                  "Background noise while studying"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setInputText(preset);
                      handleSendMessage(preset);
                    }}
                    className="cursor-pointer text-[9px] font-bold text-gray-400 hover:text-[#ff4d5d] bg-[#12141c] hover:bg-[#171b26] border border-white/5 rounded-full px-3.5 py-1.5 transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-[16px] p-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#e23744] text-white rounded-br-none font-semibold shadow-md shadow-[#e23744]/10"
                    : "bg-[#12141c] text-gray-200 border border-white/5 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#12141c] text-gray-400 border border-white/5 rounded-[16px] rounded-bl-none p-3 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-[#ff4d5d]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Panel */}
        <div className="p-4 border-t border-white/5 bg-[#12141c] space-y-2">
          {messages.length > 0 && !isReady && (
            <div className="flex justify-end">
              <button
                onClick={handleSkip}
                className="cursor-pointer text-[9px] font-black text-[#ff4d5d] hover:text-[#ff334b] uppercase tracking-wider flex items-center gap-1"
              >
                Skip to Recommendations <ArrowRight size={10} />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              disabled={isReady || isLoading}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isReady ? "Results ready" : "Describe your vibe..."}
              className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 disabled:opacity-55"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isReady || isLoading}
              className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-xl bg-[#e23744] text-white disabled:opacity-30 disabled:pointer-events-none hover:opacity-95 transition-opacity shadow-lg shadow-[#e23744]/15"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: The Recommendations Board */}
      <div className="flex-1 overflow-y-auto bg-[#090a0f] h-[60%] md:h-full scrollbar-none pb-24">
        {!isReady ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#e23744]/5 rounded-full blur-[90px]" />
            <div className="relative z-10">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">
                Recommendations will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Recommendation Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h1 className="text-lg font-black uppercase tracking-widest text-white">
                VIBE RESULTS
              </h1>
              <button
                onClick={startNewSession}
                className="cursor-pointer flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-[9px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
              >
                Reset Chat
              </button>
            </div>

            {/* Recommendations Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const isSaved = !!savedIds[rec.tmdbId];
                const isWatched = !!watchedRecord[rec.tmdbId];
                const recProviders = providers[rec.tmdbId] || [];

                return (
                  <div
                    key={rec.id || rec.tmdbId}
                    className="group flex flex-col bg-[#12141c] rounded-[24px] overflow-hidden border border-white/5 hover:border-[#e23744]/30 transition-all shadow-lg hover:shadow-2xl relative duration-300"
                  >
                    {/* Media Type Tag overlay */}
                    <span className={`absolute top-3 left-3 z-10 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      rec.mediaType === "movie" ? "district-badge-red" : "district-badge-cyan"
                    }`}>
                      {rec.mediaType === "movie" ? "Movie" : "Series"}
                    </span>

                    {/* Poster + Title Overlay */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-900 border-b border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          rec.posterPath
                            ? `https://image.tmdb.org/t/p/w500${rec.posterPath}`
                            : "/placeholder-poster.png"
                        }
                        alt={rec.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm font-black text-white tracking-tight leading-snug">
                          {rec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      {/* Reason */}
                      <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                        {rec.reason}
                      </p>

                      {/* Streaming availability */}
                      {recProviders.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase mr-1">Streaming:</span>
                          {recProviders.slice(0, 4).map((provider) => (
                            <img
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="h-5 w-5 rounded object-cover border border-white/5 bg-black/30"
                            />
                          ))}
                        </div>
                      )}

                      {/* Interactive Controls */}
                      <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleWatchlist(rec)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 text-[9px] district-btn-secondary"
                          >
                            {isSaved ? (
                              <>
                                Saved <Check size={9} className="text-emerald-400" />
                              </>
                            ) : (
                              <>
                                Save
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleWatchedClick(rec.tmdbId)}
                            disabled={isWatched}
                            className="flex-1 flex items-center justify-center gap-1 py-2 text-[9px] district-btn-secondary text-[#ff4d5d] border-[#ff4d5d]/20 hover:border-[#ff4d5d]/40 disabled:opacity-40"
                          >
                            {isWatched ? "Watched" : "Rate"}
                          </button>
                        </div>

                        {rec.mediaType === "movie" && (
                          <a
                            href={`https://www.google.com/search?q=bookmyshow+${encodeURIComponent(rec.title)}+tickets`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 py-2 text-[9px] district-btn-primary bg-[#e23744] hover:bg-[#e23744]/90 text-white shadow-md"
                          >
                            Tickets <ExternalLink size={9} />
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
    </div>
  );
}
