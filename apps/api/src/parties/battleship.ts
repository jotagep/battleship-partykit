import { type Connection, Server, type WSMessage } from 'partyserver'

const decoder = new TextDecoder()

function toText(message: WSMessage): string {
  if (typeof message === 'string') return message
  if (message instanceof ArrayBuffer) return decoder.decode(message)
  return decoder.decode(message.buffer)
}

export class Battleship extends Server {
  async onConnect(connection: Connection): Promise<void> {
    connection.send(
      JSON.stringify({
        type: 'welcome',
        id: connection.id,
        room: this.name,
      }),
    )
  }

  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    const text = toText(message)
    const payload = JSON.stringify({
      type: 'broadcast',
      from: connection.id,
      room: this.name,
      message: text,
    })

    this.broadcast(payload, [connection.id])
  }

  async onRequest(_request: Request): Promise<Response> {
    return Response.json({
      room: this.name,
      connections: [...this.getConnections()].length,
    })
  }
}
