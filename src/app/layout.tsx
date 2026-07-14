import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-gray-100 pb-8 font-sans">
        <ClerkProvider>
          {/* Main Top Header Navbar (Dynamic Client Component) */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}