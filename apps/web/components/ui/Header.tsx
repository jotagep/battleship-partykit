type HeaderProps = {
  title: string
  subtitle?: string
}
export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="space-y-4 text-center mt-20 mb-18">
      <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-linear-to-b from-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] tracking-wider">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base font-spacemono text-slate-400 tracking-widest uppercase max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </header>
  )
}
