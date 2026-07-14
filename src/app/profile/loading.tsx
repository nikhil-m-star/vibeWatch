export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1 space-y-12 animate-pulse bg-black">
      {/* Profile Header Card Skeleton */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-[#0d0d0d] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/5" />
          <div className="space-y-2">
            <div className="h-6 w-36 bg-white/5 rounded-lg" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-6 w-full md:w-auto pt-6 md:pt-0 md:pl-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center md:text-left space-y-1">
              <div className="h-2.5 w-12 bg-white/5 rounded mx-auto md:mx-0" />
              <div className="h-7 w-8 bg-white/5 rounded mx-auto md:mx-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 pb-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 w-32 bg-white/5 rounded-full" />
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-[24px] bg-[#0d0d0d] space-y-3">
            <div className="h-4 w-3/4 bg-white/5 rounded" />
            <div className="h-3 w-1/2 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
