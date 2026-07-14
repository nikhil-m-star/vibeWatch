export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-12 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-[220px] rounded-[24px] bg-[#12141c] border border-white/5 flex flex-col justify-center items-center p-8 space-y-4">
        <div className="h-8 w-2/3 sm:w-1/2 bg-white/5 rounded-lg" />
        <div className="h-4 w-1/3 bg-white/5 rounded-lg" />
        <div className="h-10 w-28 bg-[#e23744]/10 rounded-xl" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 sm:w-24 bg-white/5 rounded-full flex-none" />
        ))}
      </div>

      {/* Section 1 Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-white/5 rounded-lg" />
          <div className="h-4 w-12 bg-white/5 rounded-lg" />
        </div>
        
        {/* Horizontal Row of Skeletons */}
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-none w-[180px] md:w-[220px] space-y-3">
              <div className="aspect-[2/3] w-full rounded-[24px] bg-[#12141c] border border-white/5" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
