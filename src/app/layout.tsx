import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
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
      <body className="min-h-full flex flex-col bg-[#08090c] text-gray-100">
        <ClerkProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-4 py-3 md:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                  VIBE WATCH
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold tracking-wide text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Explore
                </Link>
                <Link href="/mood-chat" className="hover:text-white transition-colors bg-gradient-to-r from-red-500/20 to-orange-500/20 px-3 py-1.5 rounded-full border border-red-500/30 text-orange-400">
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
                <Link href="/mood-chat" className="md:hidden text-xs font-bold text-orange-400 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  Chat
                </Link>
                {!userId ? (
                  <SignInButton mode="modal">
                    <button className="cursor-pointer text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                      Sign In
                    </button>
                  </SignInButton>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/watchlist" className="md:hidden text-xs text-gray-300 hover:text-white">
                      Watchlist
                    </Link>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8 rounded-full border border-white/10 hover:border-orange-500/50 transition-colors",
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

          {/* Footer */}
          <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-gray-500 mt-auto bg-[#060709]">
            <div className="max-w-7xl mx-auto px-4">
              <p className="mb-2">© {new Date().getFullYear()} Vibe Watch. All rights reserved.</p>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Powered by NVIDIA NIM (Llama 3.3-70B) for interprets and TMDB API for streaming listings.
                Theatrical listings deep-linked to BookMyShow. No ticketing data is gathered or stored.
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}