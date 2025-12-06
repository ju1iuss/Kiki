import type { Metadata } from "next";
import { Schibsted_Grotesk, Merriweather } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageWrapper } from "@/components/language-wrapper";
import { AuthSync } from "@/components/auth-sync";
import { LoadingScreen } from "@/components/loading-screen";

const marlinsoft = localFont({
  src: "../../public/fonts/marlinsoft.otf",
  variable: "--font-marlinsoft",
  display: "swap",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted-grotesk",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://app.tasy.ai'),
  title: {
    default: "Tasy - Instant Replace",
    template: "%s | Tasy"
  },
  description: "Create Instagram ready Stories - within seconds.",
  keywords: [
    "Instagram Stories",
    "Instagram content",
    "Story creation",
    "social media content",
    "AI content creation",
    "instant stories",
    "Instagram ready",
    "story templates",
    "content creation",
    "social media tools"
  ],
  authors: [{ name: "Tasy" }],
  creator: "Tasy",
  publisher: "Tasy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.tasy.ai",
    siteName: "Tasy",
    title: "Tasy - Instant Replace",
    description: "Create Instagram ready Stories - within seconds.",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "Tasy - Instant Replace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasy - Instant Replace",
    description: "Create Instagram ready Stories - within seconds.",
    images: ["/icon.png"],
    creator: "@tasy",
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
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body
        className={`${marlinsoft.variable} font-sans antialiased m-0 p-0 h-full`}
      >
        <LoadingScreen />
        <AuthSync />
        <LanguageWrapper>
          {children}
        </LanguageWrapper>
      </body>
    </html>
  );
}
