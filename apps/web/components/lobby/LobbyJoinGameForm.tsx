'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/Input'
import { TacticalButton } from '@/components/ui/TacticalButton'

interface LobbyJoinGameFormProps {
  onJoin: (accessCode: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function LobbyJoinGameForm({ onJoin, onCancel, isLoading }: LobbyJoinGameFormProps) {
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!accessCode.trim()) {
      setError('Access code is required')
      return
    }

    setError(null)

    try {
      await onJoin(accessCode)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join game'
      setError(message)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        This mission requires an access code. Enter it to join.
      </p>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="access-code" className="block text-sm mb-2 text-slate-400">
          Access Code
        </label>
        <Input
          id="access-code"
          type="password"
          placeholder="Enter code..."
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              void handleSubmit()
            }
          }}
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div className="flex gap-3 justify-end">
        <TacticalButton variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </TacticalButton>
        <TacticalButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Join Mission'}
        </TacticalButton>
      </div>
    </div>
  )
}
