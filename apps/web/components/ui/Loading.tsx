import React from 'react'

interface LoadingProps {
  text?: string
  className?: string
}

export function Loading({ text = 'INITIALIZING SYSTEM...', className = '' }: LoadingProps) {
  return (
    <div
      className={`flex items-center justify-center text-cyan-500 font-spacemono text-4xl animate-pulse ${className}`}
    >
      {text}
    </div>
  )
}
