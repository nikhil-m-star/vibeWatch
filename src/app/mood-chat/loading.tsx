export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-76px)] overflow-hidden relative bg-[#07080c] animate-pulse">
      {/* Centered empty state skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#e23744]/20" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
        <div className="h-8 w-56 bg-white/5 rounded-lg" />
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-[110px] bg-white/[0.03] border border-white/[0.06] rounded-full" />
          ))}
        </div>
      </div>

      {/* Floating pill skeleton */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl">
        <div className="flex items-center gap-2 bg-[#11131a]/90 border border-white/10 rounded-full px-4 py-2.5 h-[52px]">
          <div className="flex-1 h-4 bg-white/5 rounded" />
          <div className="h-8 w-8 rounded-full bg-[#e23744]/15" />
        </div>
      </div>
    </div>
  );
}
