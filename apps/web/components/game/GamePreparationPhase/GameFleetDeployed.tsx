import { Grid } from '@/components/game/Grid'
import { Spinner } from '@/components/ui/Spinner'

import { useGameRoomStore } from '@/lib/stores/gameStore'

export const GameFleetDeployed = () => {
  const deployedFleet = useGameRoomStore((state) => state.deployedFleet)

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {deployedFleet && (
        <div className="space-y-3 w-50">
          <Grid size={10} ships={deployedFleet} />
        </div>
      )}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-orbitron text-neon-cyan tracking-widest">FLEET DEPLOYED</h2>
        <p className="text-slate-400 font-spacemono text-sm">Waiting for opponent to deploy...</p>
      </div>
      <Spinner text="STANDBY" />
    </div>
  )
}
