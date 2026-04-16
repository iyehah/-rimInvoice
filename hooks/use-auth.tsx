'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  signOut,
  onAuthChange,
  resetPassword,
} from '@/services/firebase/auth'
import { getUserDocument } from '@/services/firebase/firestore'
import type { User, AuthState } from '@/types/user'

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  sendPhoneOtp: (phone: string, containerId: string) => Promise<void>
  verifyPhoneOtp: (code: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const refreshUser = useCallback(async () => {
    if (state.user?.uid) {
      const userData = await getUserDocument(state.user.uid)
      if (userData) {
        setState((prev) => ({ ...prev, user: userData }))
      }
    }
  }, [state.user?.uid])

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserDocument(firebaseUser.uid)
          setState({ user: userData, loading: false, error: null })
        } catch {
          setState({ user: null, loading: false, error: 'Failed to load user data' })
        }
      } else {
        setState({ user: null, loading: false, error: null })
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await signInWithGoogle()
      setState({ user, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }))
    }
  }, [])

  const handleSignInWithFacebook = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await signInWithFacebook()
      setState({ user, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }))
    }
  }, [])

  const handleSignInWithEmail = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await signInWithEmail(email, password)
      setState({ user, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }))
    }
  }, [])

  const handleSignUpWithEmail = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await signUpWithEmail(email, password)
      setState({ user, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }))
    }
  }, [])

  const handleSendPhoneOtp = useCallback(async (phone: string, containerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await sendPhoneOtp(phone, containerId)
      setState((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      }))
    }
  }, [])

  const handleVerifyPhoneOtp = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await verifyPhoneOtp(code)
      setState({ user, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Invalid OTP',
      }))
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await signOut()
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }))
    }
  }, [])

  const handleResetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await resetPassword(email)
      setState((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }))
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithFacebook: handleSignInWithFacebook,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    sendPhoneOtp: handleSendPhoneOtp,
    verifyPhoneOtp: handleVerifyPhoneOtp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
