import { useEffect, useState } from 'react'

import { useGameRoomStore } from '@/lib/stores/gameStore'

export const GameChatNotificationDot = ({ isOpenChat }: { isOpenChat: boolean }) => {
  const { messages } = useGameRoomStore()
  const [readed, setReaded] = useState(messages.length)

  useEffect(() => {
    if (isOpenChat) {
      setReaded(messages.length)
    }
  }, [messages.length, isOpenChat])

  if (isOpenChat || readed === messages.length) return null
  return (
    <span className="absolute top-0 left-0 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
  )
}
