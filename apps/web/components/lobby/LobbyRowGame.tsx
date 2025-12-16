import { type GameActive, type GameStatus } from '@repo/shared/games'

import { TacticalButton } from '@/components/ui/TacticalButton'

interface LobbyRowGameProps {
  game: GameActive
  userId: string | undefined
  onJoin: (gameId: string) => void
  onEnter: (gameId: string) => void
  onRequestPassword: (gameId: string) => void
}

const formatStatus = (status: GameStatus) => {
  switch (status) {
    case 'waiting':
      return { label: 'WAITING', badgeClass: 'text-lime-400 bg-lime-400/10' }
    case 'deployment':
      return { label: 'DEPLOYMENT FLEET', badgeClass: 'text-sky-400 bg-sky-400/10' }
    case 'playing':
      return { label: 'IN COMBAT', badgeClass: 'text-red-400 bg-red-400/10' }
    case 'finished':
    default:
      return { label: 'FINISHED', badgeClass: 'text-slate-400 bg-slate-400/10' }
  }
}

export function LobbyRowGame({
  game,
  userId,
  onJoin,
  onEnter,
  onRequestPassword,
}: LobbyRowGameProps) {
  const { label, badgeClass } = formatStatus(game.status)
  const players = 1 + (game.player2Id ? 1 : 0)
  const isOwner = game.player1Id === userId
  const isAlreadyInGame = game.player1Id === userId || game.player2Id === userId

  const handleJoinClick = () => {
    if (game.hasPassword) {
      onRequestPassword(game.id)
      return
    }

    onJoin(game.id)
  }

  const handleEnterClick = () => {
    onEnter(game.id)
  }

  return (
    <div
      className={`grid grid-cols-5 gap-4 p-4 items-center transition-colors group
        ${isOwner ? 'bg-cyan-500/7' : ''} hover:bg-cyan-500/5`}
    >
      <div className="font-orbitron text-lg text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
        <span>{game.name}</span>
        {isOwner && <span className="h-2 w-2 rounded-full bg-cyan-300" aria-label="Your game" />}
      </div>
      <div className="text-center font-spacemono text-slate-400">{players}/2</div>
      <div className="text-center">
        <span className={`inline-block px-2 py-1 text-xs font-spacemono rounded ${badgeClass}`}>
          {label}
        </span>
      </div>
      <div className="text-center text-lg">{game.hasPassword ? '🔒' : ''}</div>
      <div className="text-right">
        {game.status === 'waiting' && !isAlreadyInGame ? (
          <TacticalButton onClick={handleJoinClick}>Join</TacticalButton>
        ) : isAlreadyInGame ? (
          <TacticalButton onClick={handleEnterClick}>Enter</TacticalButton>
        ) : (
          <TacticalButton variant="outline" disabled>
            Started
          </TacticalButton>
        )}
      </div>
    </div>
  )
}
