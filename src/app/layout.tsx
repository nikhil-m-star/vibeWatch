import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { Compass, MessageSquare, Bookmark, User } from "lucide-react";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Watch — Mood-Based Movie & Show Recommendations",
  description: "Chat with AI about how you feel and find exactly what to watch on Netflix, Prime Video, Hotstar, and more.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-gray-100 pb-28 md:pb-28">
        <ClerkProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 w-full district-panel border-b border-white/5 px-4 py-3.5 md:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-[#e23744] flex items-center justify-center text-sm text-white font-black shadow-lg shadow-[#e23744]/20 transition-transform group-hover:scale-105 duration-200">
                    V
                  </span>
                  VIBE WATCH
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-gray-400">
                <Link href="/" className="hover:text-white transition-colors">
                  Explore
                </Link>
                <Link href="/mood-chat" className="hover:text-brand transition-colors text-[#ff4d5d]">
                  Mood Chat
                </Link>
                <Link href="/watchlist" className="hover:text-white transition-colors">
                  Watchlist
                </Link>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Vibe Profile
                </Link>
              </nav>

              {/* Auth Controls */}
              <div className="flex items-center gap-4">
                {!userId ? (
                  <SignInButton mode="modal">
                    <button className="cursor-pointer text-[10px] font-black uppercase tracking-wider bg-[#e23744] text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#e23744]/15">
                      Sign In
                    </button>
                  </SignInButton>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8 rounded-full border border-white/10 hover:border-[#e23744] transition-colors",
                        },
                      }}
                    />
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Floating Bottom Tab Bar */}
          <div className="floating-bottom-nav flex items-center justify-around gap-8 sm:gap-12 px-6 sm:px-10 py-3">
            <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#e23744] transition-colors group">
              <Compass size={20} className="group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Explore</span>
            </Link>
            <Link href="/mood-chat" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#e23744] transition-colors group">
              <MessageSquare size={20} className="group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Vibe Chat</span>
            </Link>
            <Link href="/watchlist" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#e23744] transition-colors group">
              <Bookmark size={20} className="group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Watchlist</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#e23744] transition-colors group">
              <User size={20} className="group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Profile</span>
            </Link>
          </div>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-gray-500 mt-auto bg-[#07080c] pb-24">
            <div className="max-w-7xl mx-auto px-4">
              <p className="mb-2">© {new Date().getFullYear()} Vibe Watch. All rights reserved.</p>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Powered by NVIDIA NIM (Llama 3.1-8B) for interpretation and TMDB API for streaming listings.
                Theatrical listings deep-linked to BookMyShow.
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}