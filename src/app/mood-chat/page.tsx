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
  HelpCircle, Tv, Film, Loader2, ArrowRight, X 
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
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-65px)] overflow-hidden">
      {/* LEFT COLUMN: Premium Concierge Chat Panel */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-none border-b md:border-b-0 md:border-r border-white/5 bg-[#0b0c11] flex flex-col h-1/2 md:h-full relative z-20">
        
        {/* Concierge Header */}
        <div className="p-4 border-b border-white/5 bg-[#101119] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white">VIBE CONCIERGE</h2>
              <p className="text-[10px] text-orange-400 font-extrabold tracking-wide uppercase">AI MOOD INTERPRETER</p>
            </div>
          </div>
          {(messages.length > 0 || isReady) && (
            <button 
              onClick={startNewSession}
              className="cursor-pointer text-[10px] uppercase font-bold text-gray-400 hover:text-white border border-white/10 px-2.5 py-1 rounded-full transition-colors"
            >
              Reset Chat
            </button>
          )}
        </div>

        {/* Chat Bubbles Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <Sparkles className="text-orange-500/30 mb-4" size={32} />
              <h3 className="text-sm font-bold text-gray-300 mb-2">How's your vibe today?</h3>
              <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed mb-6">
                Tell me what kind of day you've had, what you're eating, or your current mood, and I'll find the perfect title.
              </p>
              
              {/* Preset suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center">
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
                    className="cursor-pointer text-[11px] font-semibold text-gray-400 hover:text-orange-400 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3.5 py-1.5 transition-colors"
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
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-br-none"
                    : "bg-[#181a24] text-gray-200 border border-white/5 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#181a24] text-gray-400 border border-white/5 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span className="text-xs font-semibold">Reading your energy...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Control Input Panel */}
        <div className="p-4 border-t border-white/5 bg-[#101119] space-y-2">
          {messages.length > 0 && !isReady && (
            <div className="flex justify-between items-center gap-2">
              <span className="text-[10px] text-gray-500 font-bold">
                Follow-ups (Max 3 turns)
              </span>
              <button
                onClick={handleSkip}
                className="cursor-pointer text-[10px] font-extrabold text-orange-400 hover:text-orange-300 uppercase tracking-wider flex items-center gap-1"
              >
                Just Recommend <ArrowRight size={10} />
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
              placeholder={
                isReady
                  ? "Recommendations are ready!"
                  : "Tell me how you're feeling..."
              }
              className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-55"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isReady || isLoading}
              className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white disabled:opacity-30 disabled:pointer-events-none hover:opacity-90 transition-opacity"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: The Recommendations Board */}
      <div className="flex-1 overflow-y-auto bg-[#08090c] h-1/2 md:h-full scrollbar-none">
        {!isReady ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
            {/* Visual background gradient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 max-w-sm flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 mb-6">
                <Play size={24} className="fill-gray-600/30" />
              </div>
              <h2 className="text-lg font-black text-white mb-2">Recommendations Locked</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Describe your mood to the Vibe Concierge in the side panel. Once we interpret your vibe, your custom movie and show list will unlock here.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Recommendation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Personalized Match
                </span>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mt-1">
                  Vibe Results
                </h1>
              </div>
              <button
                onClick={startNewSession}
                className="cursor-pointer self-start md:self-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wide px-5 py-2.5 rounded-full transition-colors"
              >
                Reset & Start New Vibe
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
                    className="group flex flex-col bg-[#11131a] rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors shadow-lg glow-card relative"
                  >
                    {/* Media Type Tag overlay */}
                    <span className="absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5 text-gray-300">
                      {rec.mediaType === "movie" ? "Movie" : "Series"}
                    </span>

                    {/* Poster + Overview */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-900 border-b border-white/5">
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
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Title at base of image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-base font-bold text-white tracking-tight leading-tight line-clamp-1">
                          {rec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      {/* Reason */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-orange-400">
                          <Sparkles size={11} className="fill-orange-400/20" /> Concierge Match Reason
                        </div>
                        <p className="text-[12px] text-gray-300 leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>

                      {/* Streaming Availability (Region India) */}
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">
                          Available on
                        </span>
                        {recProviders.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {recProviders.map((provider) => (
                              <div
                                key={provider.provider_id}
                                title={provider.provider_name}
                                className="h-7 w-7 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-black/20"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-500 font-semibold italic">
                            Not currently streaming in India
                          </p>
                        )}
                      </div>

                      {/* Interactive Controls */}
                      <div className="pt-2 border-t border-white/5 flex gap-2">
                        {/* Save to Watchlist */}
                        <button
                          onClick={() => handleToggleWatchlist(rec)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
                        >
                          {isSaved ? (
                            <>
                              Saved <Check size={11} className="text-green-500" />
                            </>
                          ) : (
                            <>
                              Watchlist <Plus size={11} />
                            </>
                          )}
                        </button>

                        {/* Mark as Watched */}
                        <button
                          onClick={() => handleWatchedClick(rec.tmdbId)}
                          disabled={isWatched}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {isWatched ? "Watched" : "Watched + Rate"}
                        </button>
                      </div>
                    </div>

                    {/* Star Rating Overlay */}
                    {activeRatingMovieId === rec.tmdbId && (
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
                        
                        {/* 5 Stars Rating Slider */}
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
                            onClick={() => handleSaveWatched(rec)}
                            className="cursor-pointer flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-black uppercase py-2.5 rounded-xl hover:opacity-95 transition-opacity"
                          >
                            Save Rating
                          </button>
                          <button
                            onClick={() => handleSaveWatched({ ...rec, ratingValue: null })}
                            className="cursor-pointer flex-1 bg-white/5 border border-white/10 text-gray-300 text-[11px] font-black uppercase py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Skip Rating
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
