import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Space_Mono } from 'next/font/google'

import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Battleship Command',
  description: 'Tactical Multiplayer Game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${spaceMono.variable} ${rajdhani.variable} bg-void text-slate-200 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
