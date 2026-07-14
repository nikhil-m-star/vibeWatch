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
    <header className="sticky top-0 z-50 w-full flex justify-center py-3 px-4">
      <nav className="flex items-center gap-2 bg-[#11131a]/90 backdrop-blur-2xl px-3 py-2 rounded-full shadow-2xl shadow-black/40">
        {/* Brand Logo - Uses generated minimalist purple logo */}
        <Link href="/" className="h-10 w-10 flex-none rounded-full overflow-hidden transition-transform hover:scale-105 duration-200">
          <img
            src="/logo.png"
            alt="Vibe Watch"
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Nav Tabs */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={16} />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          );
        })}

        {/* Auth Control - Centered Vertically */}
        <div className="flex items-center justify-center ml-1">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <UserIcon size={16} />
              </button>
            </SignInButton>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 rounded-full",
                  userButtonBox: "flex items-center justify-center",
                },
              }}
            />
          )}
        </div>
      </nav>
    </header>
  );
}
