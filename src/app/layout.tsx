import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-gray-100 pb-8">
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