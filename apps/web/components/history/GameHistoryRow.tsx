import { GameHistory } from '@repo/shared/games'

interface GameHistoryRowProps {
  game: GameHistory
  currentUserId: string
}

const formatResult = (game: GameHistory, currentUserId: string) => {
  const isWinner = game.winnerId === currentUserId
  const isDraw = game.status === 'finished' && !game.winnerId

  if (game.status !== 'finished') {
    return { label: 'IN PROGRESS', badgeClass: 'text-yellow-400 bg-yellow-400/10' }
  } else if (isWinner) {
    return { label: 'VICTORY', badgeClass: 'text-lime-400 bg-lime-400/10' }
  } else if (isDraw) {
    return { label: 'DRAW', badgeClass: 'text-slate-400 bg-slate-400/10' }
  } else {
    return { label: 'DEFEAT', badgeClass: 'text-red-400 bg-red-400/10' }
  }
}

export function GameHistoryRow({ game, currentUserId }: GameHistoryRowProps) {
  const isPlayer1 = game.player1Id === currentUserId
  const opponent = isPlayer1 ? game.player2 : game.player1
  const { label, badgeClass } = formatResult(game, currentUserId)

  return (
    <div className="grid grid-cols-4 gap-4 p-4 items-center transition-colors group hover:bg-cyan-500/5">
      <div className="font-orbitron text-lg text-slate-200 group-hover:text-cyan-300 transition-colors">
        {game.name}
      </div>
      <div className="text-center font-spacemono text-slate-400">{opponent?.name || 'Unknown'}</div>
      <div className="text-center">
        <span className={`inline-block px-2 py-1 text-xs font-spacemono rounded ${badgeClass}`}>
          {label}
        </span>
      </div>
      <div className="text-right font-spacemono text-xs text-slate-500">
        {new Date(game.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
