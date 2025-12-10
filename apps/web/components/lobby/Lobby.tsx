'use client'

import { useEffect, useState } from 'react'

import { LobbyCreateGameForm } from '@/components/lobby/LobbyCreateGameForm'
import { LobbyHeader } from '@/components/lobby/LobbyHeader'
import { LobbyRowGame } from '@/components/lobby/LobbyRowGame'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { TacticalButton } from '@/components/ui/TacticalButton'

import { authClient } from '@/lib/auth'
import { useLobbyStore } from '@/lib/stores/lobby-store'

interface LobbyProps {
  onJoinRoom: (roomId: string) => void
}

export function Lobby({ onJoinRoom }: LobbyProps) {
  const { data: session } = authClient.useSession()
  const { games, isLoading, error, fetchGames } = useLobbyStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    console.log('Fetching games in Lobby useEffect')
    void fetchGames()
  }, [fetchGames])

  const renderRows = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-sm text-slate-400 font-spacemono">Loading games…</div>
      )
    }

    if (error) {
      return <div className="p-4 text-center text-sm text-red-400 font-spacemono">{error}</div>
    }

    if (!games.length) {
      return (
        <div className="p-4 text-center text-sm text-slate-400 font-spacemono">
          No active missions available.
        </div>
      )
    }

    return games.map((game) => <LobbyRowGame key={game.id} game={game} onJoin={onJoinRoom} />)
  }

  return (
    <div className="w-full max-w-4xl z-10 space-y-8">
      <LobbyHeader sessionUserName={session?.user.name} onLogout={() => authClient.signOut()} />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Operation">
        <LobbyCreateGameForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={() => setIsCreateOpen(false)}
        />
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>ACTIVE MISSIONS</CardTitle>
          <div className="flex gap-3">
            <TacticalButton variant="ghost" onClick={() => fetchGames()}>
              Refresh
            </TacticalButton>
            <TacticalButton variant="secondary" onClick={() => setIsCreateOpen(true)}>
              New Operation
            </TacticalButton>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-spacemono text-slate-400 uppercase tracking-wider">
            <div>Mission</div>
            <div className="text-center">Players</div>
            <div className="text-center">Status</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-800/50">{renderRows()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
