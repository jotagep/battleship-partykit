'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-950/90 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-slate-200 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] group-[.toaster]:font-rajdhani group-[.toaster]:border-l-4',
          description: 'group-[.toast]:text-slate-400',
          actionButton: 'group-[.toast]:bg-cyan-400 group-[.toast]:text-slate-950 font-bold',
          cancelButton: 'group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400',
          error: 'group-[.toaster]:!border-l-red-500',
          success: 'group-[.toaster]:!border-l-lime-400',
          warning: 'group-[.toaster]:!border-l-amber-400',
          info: 'group-[.toaster]:!border-l-cyan-400',
        },
      }}
      {...props}
    />
  )
}
