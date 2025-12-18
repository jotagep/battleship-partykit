'use client'

import { useRouter } from 'next/navigation'

import { TacticalButton } from '@/components/ui/TacticalButton'

type LobbyHeaderProps = {
  sessionUserName?: string
  onLogout: () => void
}

export function LobbyHeader({ sessionUserName, onLogout }: LobbyHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
      <p className="text-xs font-spacemono text-slate-500 uppercase tracking-widest">
        Logged In State (Lobby)
      </p>
      {sessionUserName && (
        <div className="flex items-center gap-4">
          <span className="text-xs font-spacemono text-cyan-700 uppercase">
            Operator: <b>{sessionUserName}</b>
          </span>
          <TacticalButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/history')}
            className="text-xs font-spacemono text-cyan-400 hover:text-cyan-300 hover:bg-transparent hover:underline p-0 h-auto"
          >
            History
          </TacticalButton>
          <TacticalButton
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-xs font-spacemono text-red-400 hover:text-red-300 hover:bg-transparent hover:underline p-0 h-auto"
          >
            Logout
          </TacticalButton>
        </div>
      )}
    </div>
  )
}
