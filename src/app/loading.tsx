import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#090a0f]">
      <div className="flex flex-col items-center gap-4">
        {/* Sleek Pulse Loader */}
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-[#e23744]/15 border border-[#e23744]/30 animate-pulse flex items-center justify-center">
            <span className="text-white font-black text-lg">V</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border border-[#e23744]/40 animate-ping opacity-25" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">
          Loading Vibe...
        </span>
      </div>
    </div>
  );
}
