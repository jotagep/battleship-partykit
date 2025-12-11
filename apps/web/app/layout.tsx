import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Space_Mono } from 'next/font/google'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { Toaster } from '@/components/ui/Toaster'

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
        className={`${orbitron.variable} ${spaceMono.variable} ${rajdhani.variable} bg-slate-950 text-slate-200 antialiased relative min-h-screen`}
      >
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-rajdhani">
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-slate-900),var(--color-void),var(--color-void))] -z-20" />
          <div className="fixed inset-0 bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none -z-10" />
          <AuthGuard>{children}</AuthGuard>
          <Toaster />
        </main>
      </body>
    </html>
  )
}
