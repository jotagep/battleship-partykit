import { useEffect, useState } from 'react'

import { useGameRoomStore } from '@/lib/stores/game-room-store'

export const GameChatNotificationDot = ({ isOpenChat }: { isOpenChat: boolean }) => {
  const { log } = useGameRoomStore()
  const [readed, setReaded] = useState(log.length)

  useEffect(() => {
    if (isOpenChat) {
      setReaded(log.length)
    }
  }, [log.length, isOpenChat])

  if (isOpenChat || readed === log.length) return null

  return (
    <span className="absolute top-0 left-0 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
  )
}
