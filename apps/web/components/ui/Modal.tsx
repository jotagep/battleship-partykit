import * as React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-orbitron text-cyan-500">{title}</h2>}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="font-spacemono text-slate-300">{children}</div>
      </div>
    </div>
  )
}
