import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const TacticalButton = React.forwardRef<HTMLButtonElement, TacticalButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-orbitron tracking-wider uppercase',
          {
            'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] font-bold':
              variant === 'default',
            'bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20':
              variant === 'destructive',
            'border border-slate-700 text-slate-600 bg-transparent': variant === 'outline',
            'bg-lime-400/10 border border-lime-400/50 text-lime-400 hover:bg-lime-400/20':
              variant === 'secondary',
            'hover:bg-slate-800/50 hover:text-slate-200': variant === 'ghost',
            'text-cyan-500 underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
TacticalButton.displayName = 'TacticalButton'

export { TacticalButton }
