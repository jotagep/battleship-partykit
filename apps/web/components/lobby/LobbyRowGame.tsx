import { type Game, type GameStatus } from '@repo/shared/games'

import { TacticalButton } from '@/components/ui/TacticalButton'

interface LobbyRowGameProps {
  game: Game
  onJoin: (roomId: string) => void
}

const formatStatus = (status: GameStatus) => {
  switch (status) {
    case 'waiting':
      return { label: 'WAITING', badgeClass: 'text-lime-400 bg-lime-400/10' }
    case 'playing':
      return { label: 'IN COMBAT', badgeClass: 'text-red-400 bg-red-400/10' }
    case 'finished':
    default:
      return { label: 'FINISHED', badgeClass: 'text-slate-400 bg-slate-400/10' }
  }
}

export function LobbyRowGame({ game, onJoin }: LobbyRowGameProps) {
  const { label, badgeClass } = formatStatus(game.status)
  const players = 1 + (game.player2Id ? 1 : 0)

  return (
    <div className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-cyan-500/5 transition-colors group">
      <div className="font-orbitron text-lg text-slate-200 group-hover:text-cyan-300 transition-colors">
        {game.name}
      </div>
      <div className="text-center font-spacemono text-slate-400">{players}/2</div>
      <div className="text-center">
        <span className={`inline-block px-2 py-1 text-xs font-spacemono rounded ${badgeClass}`}>
          {label}
        </span>
      </div>
      <div className="text-right">
        {game.status === 'waiting' ? (
          <TacticalButton onClick={() => onJoin(game.name)}>Join</TacticalButton>
        ) : (
          <TacticalButton variant="outline" disabled>
            Observe
          </TacticalButton>
        )}
      </div>
    </div>
  )
}
