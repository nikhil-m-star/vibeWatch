"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Compass, MessageSquare, Bookmark, User as UserIcon } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const navItems = [
    { name: "Explore", href: "/", icon: Compass },
    { name: "Vibe Chat", href: "/mood-chat", icon: MessageSquare },
    { name: "Watchlist", href: "/watchlist", icon: Bookmark },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full district-panel py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-[#e23744] flex items-center justify-center text-base text-white font-black shadow-lg shadow-[#e23744]/20 transition-transform group-hover:scale-105 duration-200">
            V
          </span>
          <span className="hidden sm:inline text-sm font-black tracking-widest text-white uppercase">
            VIBE WATCH
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-black/50 border border-white/10 p-1.5 rounded-full shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#e23744] to-[#ff4d5d] text-white shadow-lg shadow-[#e23744]/25 scale-[1.03]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={15} />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Clerk Auth Controls */}
        <div className="flex items-center">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="cursor-pointer text-[10px] font-black uppercase tracking-wider bg-[#e23744] text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-[#e23744]/15">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-full border-2 border-white/10 hover:border-[#e23744] transition-colors",
                },
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
