import { ChatMessage, InfoMessage } from '@repo/shared/messages'
import { type Connection, type ConnectionContext, Server, type WSMessage } from 'partyserver'

import { auth } from '../auth'
import { type User } from '../db/schema'
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
    const cookie = ctx.request.headers.get('cookie') ?? ''

    const response = await auth(this.env).api.getSession({ headers: { cookie } })

    if (!response || !response.session || !response.user) {
      connection.close()
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

  async onRequest(_request: Request): Promise<Response> {
    return Response.json({
      room: this.name,
      connections: [...this.getConnections()].length,
    })
  }
}
