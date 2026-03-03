"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getMe, login as apiLogin, logout as apiLogout, clearTokens, getAccessToken } from "@/lib/api"
import type { AuthUser } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount — try to rehydrate from stored token
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => {
        clearTokens()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password)
    const me = await getMe()
    setUser(me)
    // Redirect based on role
    switch (me.role) {
      case "ceo":    router.push("/ceo");    break
      case "entity": router.push("/entity"); break
      case "admin":  router.push("/");       break
      default:       router.push("/");
    }
  }, [router])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
