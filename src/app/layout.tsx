import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORBYT: Digital systems built for growth",
  description:
    "ORBYT builds the connected system behind growth: AI & automation, web & digital experiences, performance marketing, tracking & data. Strategy, build, connect, measure, improve.",
  keywords: [
    "AI automation agency",
    "AI agents",
    "business automation",
    "web development",
    "digital systems",
    "growth systems",
    "performance marketing",
    "conversion optimization",
    "tracking and analytics",
    "AI consulting",
    "digital transformation",
  ],
  authors: [{ name: "ORBYT" }],
  icons: {
    icon: "/orbyt-mark.png",
  },
  openGraph: {
    title: "ORBYT: Digital systems built for growth",
    description:
      "Build the system behind your growth. AI, web, automation, marketing, tracking, connected.",
    siteName: "ORBYT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
