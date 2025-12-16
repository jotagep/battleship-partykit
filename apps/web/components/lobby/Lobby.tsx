'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { LobbyCreateGameForm } from '@/components/lobby/LobbyCreateGameForm'
import { LobbyHeader } from '@/components/lobby/LobbyHeader'
import { LobbyJoinGameForm } from '@/components/lobby/LobbyJoinGameForm'
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
  const { games, isLoading, isJoining, error, fetchGames, joinGame } = useLobbyStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  const handleJoinGame = useCallback(
    async (gameId: string) => {
      try {
        await joinGame({ gameId })
        onJoinRoom(gameId)
      } catch (error) {
        console.error('Failed to join game:', error)
      }
    },
    [joinGame, onJoinRoom],
  )

  const handleEnterGame = useCallback(
    async (gameId: string) => {
      onJoinRoom(gameId)
    },
    [onJoinRoom],
  )

  const handleJoinWithPassword = useCallback(
    async (accessCode: string) => {
      if (!selectedGameId) return

      try {
        await joinGame({ gameId: selectedGameId, accessCode })
        onJoinRoom(selectedGameId)
      } catch (_e) {
        toast.error('Unable to join mission. Please check the access code and try again.')
      } finally {
        setIsJoinOpen(false)
        setSelectedGameId(null)
      }
    },
    [joinGame, onJoinRoom, selectedGameId],
  )

  const handleRequestPassword = useCallback((gameId: string) => {
    setSelectedGameId(gameId)
    setIsJoinOpen(true)
  }, [])

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

    return games.map((game) => (
      <LobbyRowGame
        key={game.id}
        game={game}
        userId={session?.user.id}
        onJoin={handleJoinGame}
        onEnter={handleEnterGame}
        onRequestPassword={handleRequestPassword}
      />
    ))
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

      <Modal
        isOpen={isJoinOpen}
        onClose={() => {
          setIsJoinOpen(false)
          setSelectedGameId(null)
        }}
        title="Access Code Required"
      >
        <LobbyJoinGameForm
          onJoin={handleJoinWithPassword}
          onCancel={() => {
            setIsJoinOpen(false)
            setSelectedGameId(null)
          }}
          isLoading={isJoining}
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
              New Mission
            </TacticalButton>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-spacemono text-slate-400 uppercase tracking-wider">
            <div>Mission ID</div>
            <div className="text-center">Players</div>
            <div className="text-center">Status</div>
            <div className="text-center">Auth</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-800/50">{renderRows()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
