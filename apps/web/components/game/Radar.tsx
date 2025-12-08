import * as React from 'react'

import { Grid } from './Grid'

export function Radar() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-green-500/5 pointer-events-none animate-pulse" />
      <div className="border-2 border-green-900/50 rounded p-1">
        <Grid size={10} />
      </div>
      <div className="absolute top-2 right-2 text-xs font-spacemono text-green-500/50">
        RADAR ACTIVE
      </div>
    </div>
  )
}
