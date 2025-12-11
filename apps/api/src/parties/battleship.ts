import { ChatMessage, InfoMessage, RoomCloseCode } from '@repo/shared/messages'
import { eq } from 'drizzle-orm'
import { type Connection, type ConnectionContext, Server, type WSMessage } from 'partyserver'

import { auth } from '../auth'
import { Game, game, type User } from '../db/schema'
import { getDB } from '../db/utils'
import type { BindingsEnv } from '../types/env'

const decoder = new TextDecoder()

function toText(message: WSMessage): string {
  if (typeof message === 'string') return message
  if (message instanceof ArrayBuffer) return decoder.decode(message)
  return decoder.decode(message.buffer)
}

export class Battleship extends Server<BindingsEnv> {
  game: Game | null = null
  messageHistory: string[] = []
  users: Record<string, User> = {}

  async onConnect(connection: Connection, ctx: ConnectionContext): Promise<void> {
    const cookie = ctx.request.headers.get('cookie') ?? ''

    const response = await auth(this.env).api.getSession({ headers: { cookie } })

    if (!response || !response.session || !response.user) {
      connection.close(RoomCloseCode.UNAUTHORIZED, 'Unauthorized')
      return
    }

    // Check game access here if needed (e.g., access codes)
    const db = getDB(this.env)

    if (!this.game) {
      const gameData = await db.query.game.findFirst({
        where: eq(game.id, this.name),
      })
      if (!gameData) {
        connection.close(RoomCloseCode.ROOM_NOT_FOUND, 'Game not found')
        return
      }
      this.game = gameData
    }

    if (this.game.player1Id !== response.user.id && this.game.player2Id !== response.user.id) {
      connection.close(RoomCloseCode.UNAUTHORIZED, 'Unauthorized')
      return
    }

    const user: User = response.user as User
    this.users[connection.id] = user

    const welcomeMessage: InfoMessage = {
      type: 'info',
      room: this.name,
      message: `Welcome ${user.name ?? connection.id} to the battle!`,
    }
    connection.send(JSON.stringify(welcomeMessage))

    const broadcastMessage: InfoMessage = {
      type: 'info',
      room: this.name,
      message: `${user.name ?? connection.id} has joined the battle`,
    }
    this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
  }

  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    const text = toText(message)
    this.messageHistory.push(text)

    const broadcastMessage: ChatMessage = {
      type: 'chat',
      room: this.name,
      from: this.users[connection.id]?.name ?? connection.id,
      message: text,
    }
    this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
  }

  onClose(connection: Connection): void {
    const user = this.users[connection.id]

    if (user) {
      const broadcastMessage: InfoMessage = {
        type: 'info',
        room: this.name,
        message: `${user?.name} has left the battle`,
      }
      this.broadcast(JSON.stringify(broadcastMessage))
    }
  }

  async onRequest(_request: Request): Promise<Response> {
    return Response.json({
      room: this.name,
      connections: [...this.getConnections()].length,
    })
  }
}
