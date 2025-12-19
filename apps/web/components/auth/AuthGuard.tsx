'use client'

import { ReactNode } from 'react'

import { Login } from '@/components/auth/Login'
import { Loading } from '@/components/ui/Loading'

import { authClient } from '@/lib/auth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  if (sessionLoading) {
    return <Loading />
  }

  if (!session) {
    return <Login text="AUTHENTICATE ACCESS" />
  }

  return children
}
