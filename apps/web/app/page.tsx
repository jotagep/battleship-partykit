// A tiny PartySocket demo against the Battleship PartyServer.
'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { usePartySocket } from 'partysocket/react'

import { authClient } from '../lib/auth'

import styles from './page.module.css'

type LogEntry = {
  id: string
  text: string
  kind: 'system' | 'local' | 'remote'
}

function formatMessage(data: MessageEvent['data']): string {
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  return new TextDecoder().decode(data.buffer)
}

export default function Home() {
  const [host, setHost] = useState('localhost:8787')
  const [room, setRoom] = useState('demo-room')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('connecting')
  const [log, setLog] = useState<LogEntry[]>([])
  const {
    data: session,
    isPending: sessionLoading,
    refetch: refetchSession,
  } = authClient.useSession()

  const endpoint = useMemo(
    () => `${host.replace(/^https?:\/\//, '')}/parties/battleship-party/${room}`,
    [host, room],
  )

  const socket = usePartySocket({
    host,
    party: 'battleship-party',
    room,
    onOpen() {
      setStatus('connected')
      setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'system', text: 'Connected' }])
    },
    onClose(evt) {
      setStatus('closed')
      setLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'system',
          text: `Closed (${evt.code})`,
        },
      ])
    },
    onError() {
      setStatus('error')
      setLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'system',
          text: 'Socket error',
        },
      ])
    },
    onMessage(evt) {
      let text = formatMessage(evt.data)
      try {
        const parsed = JSON.parse(text)
        if (parsed?.message) {
          text = parsed.message
        } else if (parsed?.type) {
          text = JSON.stringify(parsed)
        }
      } catch (_err: unknown) {
        console.error('Error parsing message', _err)
      }
      setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'remote', text }])
    },
  })

  useEffect(() => {
    setStatus('connecting')
    setLog([
      {
        id: crypto.randomUUID(),
        kind: 'system',
        text: `Connecting to ${endpoint}`,
      },
    ])
  }, [endpoint])

  const canSend = socket?.readyState === WebSocket.OPEN && !!session

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || !socket) return
    socket.send(text)
    setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'local', text }])
    setMessage('')
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <p className={styles.label}>Hono + PartyServer demo</p>
              <h1 className={styles.title}>Battleship chat</h1>
            </div>
            <span className={styles.badge}>{status}</span>
          </div>
          <div className={styles.authRow}>
            {session ? (
              <>
                <div className={styles.user}>
                  <span>{session.user.email ?? 'Signed in'}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    authClient.signOut().then(() => {
                      setLog((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          kind: 'system',
                          text: 'Signed out',
                        },
                      ])
                      refetchSession()
                    })
                  }
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={sessionLoading}
                onClick={() =>
                  authClient.signIn.social({
                    provider: 'google',
                    callbackURL: window.location.href,
                  })
                }
              >
                Login con Google
              </button>
            )}
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>API host (wrangler dev)</span>
              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="localhost:8787"
              />
            </label>
            <label className={styles.field}>
              <span>Room</span>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="demo-room"
              />
            </label>
            <div className={styles.field}>
              <span>Endpoint</span>
              <code className={styles.code}>{endpoint.split('/').slice(1).join('/')}</code>
            </div>
          </div>

          <form className={styles.form} onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say hi to the room"
              disabled={!canSend}
            />
            <button type="submit" disabled={!canSend || !message.trim()}>
              Send
            </button>
          </form>

          <div className={styles.log} aria-live="polite">
            {log.map((entry) => (
              <div key={entry.id} className={`${styles.logLine} ${styles[entry.kind]}`}>
                {entry.text}
              </div>
            ))}
            {log.length === 0 && <div className={styles.logLine}>Waiting for messages…</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
