import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TacticalButton } from '@/components/ui/TacticalButton'

import { authClient } from '@/lib/auth'

type RoomStatus = 'WAITING' | 'IN COMBAT' | 'FINISHED'

interface Room {
  id: string
  players: number
  maxPlayers: number
  status: RoomStatus
}

// Mock data for now
const MOCK_ROOMS: Room[] = [
  { id: 'ALPHA-7', players: 1, maxPlayers: 2, status: 'WAITING' },
  { id: 'BETA-9', players: 2, maxPlayers: 2, status: 'IN COMBAT' },
  { id: 'DELTA-X', players: 1, maxPlayers: 2, status: 'WAITING' },
]

interface LobbyProps {
  onJoinRoom: (roomId: string) => void
  onCreateRoom: () => void
}

export function RoomList({ onJoinRoom, onCreateRoom }: LobbyProps) {
  const { data: session } = authClient.useSession()

  return (
    <div className="w-full max-w-4xl z-10 space-y-8">
      <div className="flex justify-between items-end border-b border-slate-800 pb-2">
        <p className="text-xs font-spacemono text-slate-500 uppercase tracking-widest">
          Logged In State (Lobby)
        </p>
        {session && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-spacemono text-cyan-700 uppercase">
              Operator: {session.user.name}
            </span>
            <TacticalButton
              variant="ghost"
              size="sm"
              onClick={() => authClient.signOut()}
              className="text-xs font-spacemono text-red-400 hover:text-red-300 hover:bg-transparent hover:underline p-0 h-auto"
            >
              Logout
            </TacticalButton>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ACTIVE MISSIONS</CardTitle>
          <TacticalButton variant="secondary" onClick={onCreateRoom}>
            New Operation
          </TacticalButton>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-spacemono text-slate-400 uppercase tracking-wider">
            <div>Mission ID</div>
            <div className="text-center">Players</div>
            <div className="text-center">Status</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {MOCK_ROOMS.map((room) => (
              <div
                key={room.id}
                className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-cyan-500/5 transition-colors group"
              >
                <div className="font-orbitron text-lg text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {room.id}
                </div>
                <div className="text-center font-spacemono text-slate-400">
                  {room.players}/{room.maxPlayers}
                </div>
                <div className="text-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-spacemono rounded ${
                      room.status === 'WAITING'
                        ? 'text-lime-400 bg-lime-400/10'
                        : room.status === 'IN COMBAT'
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-slate-400 bg-slate-400/10'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-right">
                  {room.status === 'WAITING' ? (
                    <TacticalButton onClick={() => onJoinRoom(room.id)}>Join</TacticalButton>
                  ) : (
                    <TacticalButton variant="outline" disabled>
                      Observe
                    </TacticalButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
