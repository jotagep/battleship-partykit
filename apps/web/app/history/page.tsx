'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { GameHistoryList } from '@/components/history/GameHistoryList'
import { TacticalButton } from '@/components/ui/TacticalButton'

import { authClient } from '@/lib/auth'

export default function HistoryPage() {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  return (
    <AuthGuard>
      <div className="w-full max-w-4xl z-10 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-2">
          <p className="text-xs font-spacemono text-slate-500 uppercase tracking-widest">
            Mission History (Archive)
          </p>
          <TacticalButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-xs font-spacemono text-cyan-400 hover:text-cyan-300 hover:bg-transparent hover:underline p-0 h-auto flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to Lobby
          </TacticalButton>
        </div>

        {session?.user && <GameHistoryList userId={session.user.id} />}
      </div>
    </AuthGuard>
  )
}
