interface GameHistoryPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function GameHistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GameHistoryPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-4 font-spacemono text-xs">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-slate-800 rounded bg-slate-900 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
      >
        PREV
      </button>
      <span className="text-slate-400">
        PAGE {currentPage} OF {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-slate-800 rounded bg-slate-900 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
      >
        NEXT
      </button>
    </div>
  )
}
