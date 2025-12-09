'use client'

/**
 * MAIN LANDING PAGE
 * This is the primary landing page for the application.
 * Route: / (root)
 * All landing page changes should be made here.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Key, ScanLine, Shield, Smartphone, Cloud } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth()
  const isLoggedIn = isSignedIn ?? false
  const loading = !isLoaded

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-[#191919]" 
      data-landing-page
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
      }}
    >
      {/* Floating Cloud Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 px-3 sm:px-4" style={{ zIndex: 100 }}>
        <nav className="w-full max-w-sm">
          <div className="bg-[#191919] backdrop-blur-xl rounded-full border border-gray-600/60 shadow-lg px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Link href="/" className="flex items-center justify-center text-white hover:text-gray-300 transition-colors min-h-[44px] min-w-[44px]">
                <Image 
                  src="/favicon.ico" 
                  alt="Kiki" 
                  width={24} 
                  height={24}
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  unoptimized
                />
              </Link>
              <div className="hidden md:flex items-center gap-4 lg:gap-6">
                <Link href="#reviews" className="text-sm lg:text-base font-medium text-white hover:text-gray-300 transition-colors font-marlinsoft min-h-[44px] flex items-center">
                  Bewertungen
                </Link>
                <Link href="#pricing" className="text-sm lg:text-base font-medium text-white hover:text-gray-300 transition-colors font-marlinsoft min-h-[44px] flex items-center">
                  Preise
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {!loading && !isLoggedIn && (
                  <Button asChild variant="outline" size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm border-white/20 text-white hover:bg-white/10 font-marlinsoft min-h-[40px]">
                    <Link href="/sign-in">
                      Einloggen
                    </Link>
                  </Button>
                )}
                {!loading && (
                  <Button asChild size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-white text-black hover:bg-gray-200 border-0 font-marlinsoft group min-h-[40px]">
                    <Link href={isLoggedIn ? "/dashboard" : "/sign-up"} className="flex items-center gap-1 sm:gap-1.5 text-black">
                      <span className="hidden sm:inline">{isLoggedIn ? "Dashboard" : "Loslegen"}</span>
                      <span className="sm:hidden">{isLoggedIn ? "Dash" : "Start"}</span>
                      <span className="relative w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 absolute transition-transform duration-300 group-hover:translate-x-1 text-black" />
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 pt-40 sm:pt-48 md:pt-72 pb-12 sm:pb-16" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Reviews */}
          <div className="flex items-center justify-center px-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              {/* Google Reviews */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-4 sm:h-5 w-px bg-white/20"></div>
              
              {/* Review Count */}
              <span className="text-xs sm:text-sm text-gray-300 font-medium">100+ Bewertungen</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 font-marlinsoft leading-[1.1] tracking-tight px-2">
            Verliere nie wieder deine Schlüssel
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 font-marlinsoft max-w-2xl mx-auto px-2 leading-relaxed">
            Intelligentes Schlüsselmanagement für das moderne Leben. 
            Verwalte alle deine physischen Schlüssel digital – einfach, sicher und immer verfügbar.
          </p>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            {!loading && (
              <Button asChild size="lg" className="w-auto min-w-[160px] sm:min-w-[220px] text-sm sm:text-lg px-4 sm:px-8 py-4 sm:py-7 bg-white text-black hover:bg-gray-200 border-0 font-marlinsoft group min-h-[48px] sm:min-h-[60px]">
                <Link href={isLoggedIn ? "/dashboard" : "/sign-up"} className="flex items-center justify-center gap-2 sm:gap-3">
                  {isLoggedIn ? "Zum Dashboard" : "Loslegen"}
                  <span className="relative w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 absolute transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-left mb-2 sm:mb-3 font-marlinsoft">
              Warum Kiki?
            </h2>
            <p className="text-sm sm:text-base text-gray-400 text-left">
              Alles was du brauchst für intelligentes Schlüsselmanagement
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">Digitale Schlüsselverwaltung</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Verwalte alle deine physischen Schlüssel digital in einer sicheren Cloud-Lösung. Nie wieder Schlüssel verlieren.
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">KI-gestützte Erkennung</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Scanne deine Schlüssel mit der Kamera und unsere KI erkennt automatisch den Typ, die Marke und wichtige Details.
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">Sicher & Privat</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Deine Daten sind verschlüsselt und sicher gespeichert. Volle Kontrolle über deine Informationen.
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">Immer dabei</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Zugriff auf alle deine Schlüsselinformationen von jedem Gerät aus – Smartphone, Tablet oder Computer.
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">Cloud-Synchronisation</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Alle deine Schlüsseldaten werden automatisch synchronisiert und sind immer aktuell verfügbar.
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 font-marlinsoft">Einfach zu bedienen</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Intuitive Benutzeroberfläche für schnelle und einfache Verwaltung deiner Schlüssel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white/5 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-left mb-2 sm:mb-3 font-marlinsoft">
              Vertrauen von Nutzern weltweit
            </h2>
            <p className="text-sm sm:text-base text-gray-400 text-left">
              Über 1.000 Nutzer vertrauen bereits auf Kiki für ihr Schlüsselmanagement
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#191919] border border-white/10 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-marlinsoft">1.000+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Aktive Nutzer</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Nutzer aus über 50 Ländern verwalten ihre Schlüssel mit Kiki
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-marlinsoft">100+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Bewertungen</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Durchschnittlich 4.9 von 5 Sternen auf Google
              </p>
            </div>
            
            <div className="bg-[#191919] border border-white/10 rounded-lg p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-marlinsoft">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-400">Uptime</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Zuverlässiger Service rund um die Uhr verfügbar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4 font-marlinsoft">Produkt</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Preise</Link></li>
                <li><Link href="/dashboard" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4 font-marlinsoft">Unternehmen</h3>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Über uns</Link></li>
                <li><Link href="#contact" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Kontakt</Link></li>
                <li><Link href="#careers" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Karriere</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4 font-marlinsoft">Rechtliches</h3>
              <ul className="space-y-2">
                <li><Link href="#privacy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Datenschutz</Link></li>
                <li><Link href="#terms" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">AGB</Link></li>
                <li><Link href="#imprint" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Impressum</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4 font-marlinsoft">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#help" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Hilfe</Link></li>
                <li><Link href="#faq" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#support" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/favicon.ico" 
                alt="Kiki" 
                width={20} 
                height={20}
                className="h-5 w-5"
                unoptimized
              />
              <span className="text-xs sm:text-sm text-gray-400">© 2024 Kiki. Alle Rechte vorbehalten.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#twitter" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </Link>
              <Link href="#linkedin" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
