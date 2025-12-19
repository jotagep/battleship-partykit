import { authClient } from '@/lib/auth'

type LoginProps = {
  text: string
}

export function Login({ text }: LoginProps) {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-12 z-10">
      <button
        onClick={handleLogin}
        className="group cursor-pointer relative px-12 py-6 bg-cyan-500/10 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <span className="relative font-orbitron text-xl md:text-2xl font-bold text-cyan-300 tracking-widest group-hover:text-cyan-100 transition-colors">
          {text}
        </span>

        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500" />
      </button>
    </div>
  )
}
