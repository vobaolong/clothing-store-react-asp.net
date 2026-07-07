import { useEffect, useState } from 'react'
import { refreshToken } from '@/api/auth-api'
import {
  getAuthToken,
  getRememberMeToken,
  setAuthToken,
  setRememberMeToken,
  removeRememberMeToken,
  getCurrentUser
} from '@/state/auth/auth-session'
import type { JwtPayload } from '@/types'

type RefreshState =
  | { status: 'loading' }
  | { status: 'done'; user: JwtPayload | null }

export function useRememberMeRefresh(): RefreshState {
  const [state, setState] = useState<RefreshState>(() => {
    const token = getAuthToken()
    const user = getCurrentUser()
    if (token && user) {
      return { status: 'done', user }
    }
    if (!getRememberMeToken()) {
      return { status: 'done', user: null }
    }
    return { status: 'loading' }
  })

  useEffect(() => {
    if (state.status !== 'loading') return

    const rememberMeToken = getRememberMeToken()
    if (!rememberMeToken) return

    refreshToken(rememberMeToken)
      .then((data) => {
        setAuthToken(data.token)
        if (data.rememberMeToken) {
          setRememberMeToken(data.rememberMeToken)
        } else {
          removeRememberMeToken()
        }
        setState({ status: 'done', user: getCurrentUser() })
      })
      .catch(() => {
        removeRememberMeToken()
        setState({ status: 'done', user: null })
      })
  }, [state.status])

  return state
}
