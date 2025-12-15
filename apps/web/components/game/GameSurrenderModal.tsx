import { Modal } from '../ui/Modal'
import { TacticalButton } from '../ui/TacticalButton'

interface GameSurrenderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function GameSurrenderModal({ isOpen, onClose, onConfirm }: GameSurrenderModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SURRENDER PROTOCOL">
      <div className="space-y-6">
        <p className="text-slate-300">
          Warning: Surrendering will end the battle immediately and mark this mission as a loss.
        </p>
        <p className="text-neon-red font-bold">Are you sure you want to surrender?</p>
        <div className="flex gap-3 justify-end">
          <TacticalButton onClick={onClose} variant="default" size="sm">
            No
          </TacticalButton>
          <TacticalButton onClick={onConfirm} variant="destructive" size="sm">
            Yes, Surrender
          </TacticalButton>
        </div>
      </div>
    </Modal>
  )
}
