export default function Loading() {
  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-68px)] overflow-hidden animate-pulse">
      {/* LEFT COLUMN: Chat Panel Skeleton */}
      <div className="w-full md:w-[350px] lg:w-[380px] flex-none border-b md:border-b-0 md:border-r border-white/5 bg-[#0b0c11] flex flex-col h-[40%] md:h-full">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-white/5 bg-[#12141c] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#e23744]/30" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        </div>

        {/* Chat Area Skeleton */}
        <div className="flex-1 overflow-hidden p-4 space-y-6 bg-[#090a0f] premium-dots flex flex-col items-center justify-center">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-[120px] bg-white/5 rounded-full" />
            ))}
          </div>
        </div>

        {/* Input Panel Skeleton */}
        <div className="p-4 border-t border-white/5 bg-[#12141c]/95">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-black/50 border border-white/10 rounded-xl" />
            <div className="h-10 w-10 rounded-xl bg-[#e23744]/15" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results Skeleton */}
      <div className="flex-1 overflow-hidden bg-[#07080c] h-[60%] md:h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-3 w-48 bg-white/5 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
