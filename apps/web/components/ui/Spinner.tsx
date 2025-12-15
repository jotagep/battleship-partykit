export const Spinner = ({ text }: { text?: string }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="animate-spin h-6 w-6 rounded-full border-2 border-neon-lime border-t-transparent"></div>
      {text && <span className="font-spacemono text-slate-300">{text}</span>}
    </div>
  )
}
