import { getOrCreateUser } from "@/lib/user";
import { getPastQueries } from "@/app/actions/chat";
import { getWatchHistory } from "@/app/actions/history";
import { getWatchlist } from "@/app/actions/watchlist";
import ProfileTabs from "./ProfileTabs";
import { History, Bookmark, MessageSquare } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [clerkUser, user] = await Promise.all([
    currentUser(),
    getOrCreateUser(),
  ]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black">
        <p className="text-gray-400 text-sm">Please sign in to view your profile.</p>
      </div>
    );
  }

  // Parallel fetch stats, past queries, and history
  const [pastQueries, watchHistory, watchlist] = await Promise.all([
    getPastQueries(),
    getWatchHistory(),
    getWatchlist(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1 space-y-12 bg-black">
      {/* Profile Header Card - Borderless, solid bg */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-[#0d0d0d] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 district-card">
        <div className="flex items-center gap-4 relative z-10">
          {clerkUser?.imageUrl ? (
            <img
              src={clerkUser.imageUrl}
              alt={user.name || "Profile"}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#a855f7] flex items-center justify-center font-black text-2xl text-white tracking-tighter">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
              {user.name || "User Profile"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 relative z-10 w-full md:w-auto pt-6 md:pt-0 md:pl-10">
          <div className="text-center md:text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">
              Sessions
            </span>
            <span className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-1">
              <MessageSquare size={14} className="text-[#a855f7]" /> {pastQueries.length}
            </span>
          </div>

          <div className="text-center md:text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">
              Watchlist
            </span>
            <span className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-1">
              <Bookmark size={14} className="text-[#a855f7]" /> {watchlist.length}
            </span>
          </div>

          <div className="text-center md:text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">
              Watched
            </span>
            <span className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-1">
              <History size={14} className="text-[#a855f7]" /> {watchHistory.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation and lists */}
      <ProfileTabs pastQueries={pastQueries} watchHistory={watchHistory} />
    </div>
  );
}
