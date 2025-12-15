import { type FormEvent, useState } from 'react'

import { Input } from '@/components/ui/Input'
import { TacticalButton } from '@/components/ui/TacticalButton'

import { authClient } from '@/lib/auth'
import { useLobbyStore } from '@/lib/stores/lobby-store'

interface LobbyCreateGameFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function LobbyCreateGameForm({ onCancel, onSuccess }: LobbyCreateGameFormProps) {
  const { data: session } = authClient.useSession()
  const { isCreating, createGame } = useLobbyStore()
  const [name, setName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const trimmedName = name.trim()
  const isNameValid = trimmedName.length >= 4
  const hasAccessCode = accessCode.length > 0
  const isAccessCodeDigits = !hasAccessCode || /^[0-9]+$/.test(accessCode)
  const isAccessCodeLengthValid =
    !hasAccessCode || (accessCode.length >= 4 && accessCode.length <= 8)
  const isAccessValid = isAccessCodeDigits && isAccessCodeLengthValid
  const isFormValid = isNameValid && isAccessValid

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!session?.user?.id) {
      setFormError('You must be logged in to create a game')
      return
    }

    if (!isFormValid) {
      setFormError('Please fix the form errors')
      return
    }

    try {
      setFormError(null)

      await createGame({
        name: trimmedName,
        accessCode: hasAccessCode ? accessCode : undefined,
        player1Id: session.user.id,
      })

      setName('')
      setAccessCode('')
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create game'
      setFormError(message)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-spacemono text-slate-300">Mission Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ALPHA-7"
          minLength={4}
          required
        />
        <p className="text-xs text-slate-500 font-spacemono">Minimum 4 characters.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-spacemono text-slate-300">Access Code (optional)</label>
        <Input
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="4 to 8 digits"
          minLength={4}
          maxLength={8}
        />
        <p className="text-xs text-slate-500 font-spacemono">
          4-8 digits. Leave empty to make it public.
        </p>
      </div>

      {!isAccessValid && (
        <p className="text-xs text-red-400 font-spacemono">Access code must be 4-8 digits.</p>
      )}

      {formError && <p className="text-sm text-red-400 font-spacemono">{formError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <TacticalButton type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
          Cancel
        </TacticalButton>
        <TacticalButton type="submit" disabled={!isFormValid || isCreating}>
          {isCreating ? 'Sending…' : 'Send'}
        </TacticalButton>
      </div>
    </form>
  )
}
