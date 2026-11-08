import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { RootJsonLd } from "@/components/seo/json-ld";

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

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://orbytonward.tech"),
  title: {
    default:
      "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
    template: "%s | ORBYT ONWARD",
  },
  description:
    "ORBYT ONWARD is a Bangladesh-based software development and digital systems company building custom software, web applications, SaaS platforms, AI automation, and connected digital growth systems.",
  keywords: [
    "software development company bangladesh",
    "custom software development bangladesh",
    "web application development bangladesh",
    "SaaS development company",
    "AI automation company",
    "digital systems company",
    "performance marketing agency bangladesh",
    "ORBYT ONWARD",
    "ORBYT",
    "full-stack software engineering",
  ],
  authors: [{ name: "ORBYT ONWARD", url: "https://orbytonward.tech" }],
  creator: "ORBYT ONWARD",
  publisher: "ORBYT ONWARD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/orbyt-mark.png",
    apple: "/orbyt-mark.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
    description:
      "ORBYT ONWARD builds connected digital systems by combining software engineering, AI, automation, marketing, and creative execution.",
    url: "https://orbytonward.tech",
    siteName: "ORBYT ONWARD",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/art/sadias-ielts-showcase.png",
        width: 2048,
        height: 1536,
        alt: "ORBYT ONWARD — Software Development & Digital Systems Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
    description:
      "ORBYT ONWARD builds connected digital systems by combining software engineering, AI, automation, marketing, and creative execution.",
    images: ["/images/art/sadias-ielts-showcase.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <RootJsonLd />
      </head>
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
