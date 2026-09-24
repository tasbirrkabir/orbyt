import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  title: "Orbyt — Brand System",
  description:
    "Orbyt brand system: bold flat color, pixel precision, and relentless forward motion. Living style guide with colors, type, logo, and components.",
  keywords: [
    "Orbyt",
    "brand system",
    "design system",
    "style guide",
    "Next.js",
    "Tailwind CSS",
    "shadcn/ui",
  ],
  authors: [{ name: "Orbyt Studio" }],
  icons: {
    icon: "/orbyt-mark.png",
  },
  openGraph: {
    title: "Orbyt — Brand System",
    description:
      "Bold flat color, pixel precision, and relentless forward motion.",
    siteName: "Orbyt",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
