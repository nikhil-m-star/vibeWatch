export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1 animate-pulse">
      {/* Title Header Skeleton */}
      <div className="border-b border-white/5 pb-6 mb-8">
        <div className="h-3 w-20 bg-white/5 rounded mb-2" />
        <div className="h-8 w-40 bg-white/5 rounded-lg" />
      </div>

      {/* Watchlist Grid Skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[28px] bg-[#11131a] border border-white/5 overflow-hidden">
            <div className="aspect-[2/3] bg-white/[0.02]" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 flex-1 bg-white/5 rounded-xl" />
                <div className="h-8 flex-1 bg-white/5 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
