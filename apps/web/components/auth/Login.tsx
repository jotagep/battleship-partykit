import { authClient } from '@/lib/auth'

export function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 z-10">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-linear-to-b from-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] tracking-wider">
          BATTLESHIP COMMAND
        </h1>
        <p className="text-sm md:text-base font-spacemono text-slate-400 tracking-widest uppercase max-w-2xl mx-auto">
          Strategy decides who floats — and who sinks.
        </p>
      </div>

      <button
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: window.location.href,
          })
        }
        className="group relative px-12 py-6 bg-cyan-500/10 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <span className="relative font-orbitron text-xl md:text-2xl font-bold text-cyan-300 tracking-widest group-hover:text-cyan-100 transition-colors">
          AUTHENTICATE ACCESS
        </span>

        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500" />
      </button>
    </div>
  )
}
