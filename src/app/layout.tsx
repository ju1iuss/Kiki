import type { Metadata } from "next";
import { Schibsted_Grotesk, Merriweather } from "next/font/google";
import "./globals.css";
import { LanguageWrapper } from "@/components/language-wrapper";

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
  title: "Tasy - Automate Your Social Media Managers",
  description: "Automated accounts, automated attention, automated growth. We create the accounts, post your content, and engage like humans.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${schibstedGrotesk.variable} ${merriweather.variable} font-sans antialiased m-0 p-0 h-full`}
        style={{ letterSpacing: '-0.08em' }}
      >
        <LanguageWrapper>
          {children}
        </LanguageWrapper>
      </body>
    </html>
  );
}
