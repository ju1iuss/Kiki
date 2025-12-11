import type { Metadata } from "next";
import { Schibsted_Grotesk, Merriweather } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import "./globals.css";
import { LanguageWrapper } from "@/components/language-wrapper";
import { AuthSync } from "@/components/auth-sync";

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
  metadataBase: new URL('https://mamakey.app'),
  title: {
    default: "KeyScan - Der sichere Tresor für deine Schlüssel",
    template: "%s | KeyScan"
  },
  description: "KeyScan ist der sichere Tresor für deine physischen Schlüssel. Speichere und erkenne alle deine Schlüssel digital mit KI-gestützter Erkennung.",
  keywords: [
    "Schlüsselverwaltung",
    "Schlüssel Tresor",
    "physische Schlüssel",
    "Schlüssel erkennen",
    "KI Schlüsselerkennung",
    "Schlüsselmanagement",
    "digitale Schlüsselverwaltung",
    "Schlüssel scannen",
    "Schlüssel speichern",
    "Schlüssel organisieren"
  ],
  authors: [{ name: "KeyScan" }],
  creator: "KeyScan",
  publisher: "KeyScan",
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
    locale: "de_DE",
    url: "https://mamakey.app",
    siteName: "KeyScan",
    title: "KeyScan - Der sichere Tresor für deine Schlüssel",
    description: "KeyScan ist der sichere Tresor für deine physischen Schlüssel. Speichere und erkenne alle deine Schlüssel digital mit KI-gestützter Erkennung.",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "KeyScan - Der sichere Tresor für deine Schlüssel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyScan - Der sichere Tresor für deine Schlüssel",
    description: "KeyScan ist der sichere Tresor für deine physischen Schlüssel. Speichere und erkenne alle deine Schlüssel digital mit KI-gestützter Erkennung.",
    images: ["/icon.png"],
    creator: "@mamakey",
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
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="de" className="h-full dark">
        <body
          className={`${marlinsoft.variable} font-sans antialiased m-0 p-0 h-full`}
        >
          <AuthSync />
          <LanguageWrapper>
            {children}
          </LanguageWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
