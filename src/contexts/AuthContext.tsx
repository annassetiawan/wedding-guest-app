'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log('[Auth Handler] Initialized')

    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth State]', event, session?.user?.id)

        setUser(session?.user ?? null)
        setLoading(false)

        // CRITICAL: Only redirect on explicit sign out
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out, redirecting to login')
          router.push('/login')
          return
        }

        // DO NOT redirect on token refresh
        if (event === 'TOKEN_REFRESHED') {
          // Token refresh happens automatically when:
          // - User switches tabs
          // - Session expires and auto-refreshes
          // - Browser wakes from sleep
          // DO NOTHING - let user stay on current page
          console.log('[Auth] Token refreshed, staying on current page')
          return
        }

        // Only redirect to dashboard if signing in from login/register page
        if (event === 'SIGNED_IN') {
          const currentPath = window.location.pathname
          console.log('[Auth Event]', {
            event,
            userId: session?.user?.id,
            currentPath,
            action: currentPath === '/login' || currentPath === '/register' ? 'redirecting to dashboard' : 'no redirect'
          })

          if (currentPath === '/login' || currentPath === '/register') {
            router.push('/dashboard')
          }
          // Otherwise, stay on current page
          return
        }

        // For all other events (USER_UPDATED, etc), do nothing
        console.log('[Auth] Event:', event, '- no action taken')
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Successfully signed in!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      if (data.user?.identities?.length === 0) {
        throw new Error('An account with this email already exists')
      }

      toast.success('Account created! Please check your email to verify.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
