import { BroadcastMessage, WelcomeMessage } from '@repo/shared/messages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { type Connection, type ConnectionContext, Server, type WSMessage } from 'partyserver'

import { type User, user as userTable } from '../db/schema'
import type { BindingsEnv } from '../types/env'

const decoder = new TextDecoder()

function toText(message: WSMessage): string {
  if (typeof message === 'string') return message
  if (message instanceof ArrayBuffer) return decoder.decode(message)
  return decoder.decode(message.buffer)
}

export class Battleship extends Server<BindingsEnv> {
  messageHistory: string[] = []
  users: Record<string, User> = {}

  async onConnect(connection: Connection, ctx: ConnectionContext): Promise<void> {
    // Obtener userId del query string
    const url = new URL(ctx.request.url)
    const userId = url.searchParams.get('userId')

    let user: User | undefined = undefined

    if (userId) {
      try {
        const db = drizzle(this.env.DB)
        const userData = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1)

        if (userData.length > 0) {
          user = userData[0]
          if (user) {
            this.users[connection.id] = user
          }
        }
      } catch (error) {
        console.error('Error fetching user from DB:', error)
      }
    }

    const welcomeMessage: WelcomeMessage = {
      type: 'welcome',
      room: this.name,
    }
    connection.send(JSON.stringify(welcomeMessage))

    const broadcastMessage: BroadcastMessage = {
      type: 'broadcast',
      room: this.name,
      from: 'system',
      message: `${user?.name ?? connection.id} has joined the battle`,
    }
    this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
  }

  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    const text = toText(message)
    this.messageHistory.push(text)

    const broadcastMessage: BroadcastMessage = {
      type: 'broadcast',
      room: this.name,
      from: connection.id,
      message: text,
    }
    this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
  }

  async onRequest(_request: Request): Promise<Response> {
    return Response.json({
      room: this.name,
      connections: [...this.getConnections()].length,
    })
  }
}
