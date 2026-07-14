"use client";

import { useState } from "react";
import { Star, MessageSquare, History, Calendar, Film, Tv, Sparkles, Trash2 } from "lucide-react";
import { deleteFromHistory } from "@/app/actions/history";

interface ProfileTabsProps {
  pastQueries: any[];
  watchHistory: any[];
}

export default function ProfileTabs({ pastQueries, watchHistory: initialHistory }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"history" | "chat">("history");
  const [watchHistory, setWatchHistory] = useState<any[]>(initialHistory);

  const handleDeleteHistory = async (tmdbId: number, mediaType: string) => {
    // Optimistic delete
    setWatchHistory((prev) => prev.filter((item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)));

    try {
      await deleteFromHistory(tmdbId, mediaType as "movie" | "tv");
    } catch (err) {
      console.error(err);
      // Revert if error
      setWatchHistory(watchHistory);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 gap-6 text-sm font-semibold tracking-wide">
        <button
          onClick={() => setActiveTab("history")}
          className={`cursor-pointer pb-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "history"
              ? "border-orange-500 text-white"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <History size={16} /> Watch History ({watchHistory.length})
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`cursor-pointer pb-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "chat"
              ? "border-orange-500 text-white"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <MessageSquare size={16} /> Past Vibe Chats ({pastQueries.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {watchHistory.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-8 bg-[#11131a] rounded-3xl border border-white/5">
              <History size={24} className="text-gray-600 mb-3" />
              <p className="text-xs text-gray-500">You haven't marked any titles as watched yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {watchHistory.map((item) => (
                <div
                  key={`${item.mediaType}-${item.tmdbId}`}
                  className="p-4 bg-[#11131a] rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
                      {item.mediaType === "movie" ? <Film size={18} /> : <Tv size={18} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 capitalize">{item.mediaType}</span>
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500 font-extrabold ml-2 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <Star size={10} className="fill-amber-500" /> {item.rating} / 5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-semibold hidden sm:inline">
                      {new Date(item.watchedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => handleDeleteHistory(item.tmdbId, item.mediaType)}
                      className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="Remove from history"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div className="space-y-6">
          {pastQueries.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-8 bg-[#11131a] rounded-3xl border border-white/5">
              <MessageSquare size={24} className="text-gray-600 mb-3" />
              <p className="text-xs text-gray-500">No past vibe chat sessions recorded.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pastQueries.map((query) => {
                const userMsg = query.conversation.find((m: any) => m.role === "user")?.content || "";
                const tags = query.interpretedTags || {};
                
                return (
                  <div
                    key={query.id}
                    className="p-6 bg-[#11131a] rounded-3xl border border-white/5 space-y-4"
                  >
                    {/* Query Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                        <Calendar size={13} />
                        {new Date(query.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                      
                      {/* Interpreted tags capsules */}
                      {tags.tone && tags.tone.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.tone.slice(0, 3).map((tone: string) => (
                            <span
                              key={tone}
                              className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 border border-orange-500/25 px-2.5 py-0.5 rounded-full text-orange-400"
                            >
                              {tone}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Opening request */}
                    <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[9px] uppercase tracking-wide font-extrabold text-gray-500 block mb-1">
                        Opening Vibe Request
                      </span>
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-medium italic">
                        "{userMsg}"
                      </p>
                    </div>

                    {/* Recommendations List */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-orange-400" /> Generated Suggestions ({query.recommendations?.length || 0})
                      </span>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {query.recommendations?.map((rec: any) => (
                          <div
                            key={rec.id}
                            className="p-3 bg-black/20 border border-white/5 rounded-2xl flex flex-col gap-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded">
                                {rec.mediaType}
                              </span>
                              <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">
                                {rec.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2">
                              {rec.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
