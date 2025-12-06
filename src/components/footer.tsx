'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative w-full bg-black border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center">
            <Image
              src="/pink.png"
              alt="Tasy Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              unoptimized
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-marlinsoft">
            <Link href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#reviews" className="hover:text-white transition-colors">
              Reviews
            </Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 font-marlinsoft">
            © {new Date().getFullYear()} Tasy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
