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
      <body className="min-h-full flex flex-col bg-[#090a0f] text-gray-100 pb-8">
        <ClerkProvider>
          {/* Main Top Header Navbar */}
          <header className="sticky top-0 z-50 w-full district-panel border-b border-white/5 py-3 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-1 group">
                <span className="h-7 w-7 rounded-lg bg-[#e23744] flex items-center justify-center text-sm text-white font-black shadow-lg shadow-[#e23744]/20 transition-transform group-hover:scale-105 duration-200">
                  V
                </span>
                <span className="hidden sm:inline text-xs font-black tracking-widest text-white uppercase ml-1">
                  VIBE WATCH
                </span>
              </Link>

              {/* Navigation Tabs (Primary) */}
              <nav className="flex items-center gap-4 sm:gap-6 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full">
                <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[9px] font-black uppercase tracking-wider">
                  <Compass size={13} />
                  <span className="hidden md:inline">Explore</span>
                </Link>
                <Link href="/mood-chat" className="flex items-center gap-1.5 text-[#ff4d5d] hover:text-[#ff334b] transition-colors text-[9px] font-black uppercase tracking-wider">
                  <MessageSquare size={13} />
                  <span className="hidden md:inline">Vibe Chat</span>
                </Link>
                <Link href="/watchlist" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[9px] font-black uppercase tracking-wider">
                  <Bookmark size={13} />
                  <span className="hidden md:inline">Watchlist</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[9px] font-black uppercase tracking-wider">
                  <User size={13} />
                  <span className="hidden md:inline">Profile</span>
                </Link>
              </nav>

              {/* Clerk Auth Controls */}
              <div className="flex items-center">
                {!userId ? (
                  <SignInButton mode="modal">
                    <button className="cursor-pointer text-[9px] font-black uppercase tracking-wider bg-[#e23744] text-white px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-md shadow-[#e23744]/15">
                      Sign In
                    </button>
                  </SignInButton>
                ) : (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-7 w-7 rounded-full border border-white/10 hover:border-[#e23744] transition-colors",
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-gray-500 mt-auto bg-[#07080c]">
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