import { TacticalButton } from '../ui/TacticalButton'

interface GameHeaderProps {
  gameName: string
  status: string
  onLeave: () => void
}

export function GameHeader({ gameName, status, onLeave }: GameHeaderProps) {
  return (
    <div className="p-6 md:p-8 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40">
      <div>
        <p className="text-xs font-spacemono text-neon-cyan/70 uppercase tracking-widest mb-1">
          <b>Mission:</b> {gameName}
        </p>
        <h1 className="text-3xl md:text-4xl font-orbitron font-bold tracking-wider bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          BATTLESHIP<span className="text-neon-cyan">.CMD</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/50 border border-slate-800">
          <div className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status === 'connected'
                  ? 'bg-neon-lime'
                  : status === 'error'
                    ? 'bg-neon-red'
                    : 'bg-amber-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                status === 'connected'
                  ? 'bg-neon-lime'
                  : status === 'error'
                    ? 'bg-neon-red'
                    : 'bg-amber-400'
              }`}
            ></span>
          </div>
          <span className="text-sm font-spacemono uppercase text-slate-300">{status}</span>
        </div>
        <TacticalButton onClick={onLeave} variant="destructive" size="sm">
          Abort
        </TacticalButton>
      </div>
    </div>
  )
}
