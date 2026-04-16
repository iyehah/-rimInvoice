import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'
import { auth } from './config'
import { createUserDocument, getUserDocument, updateUserLastLogin } from './firestore'
import type { User } from '@/types/user'

// Providers
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

// Google Sign In
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    
    // Check if user exists, if not create document
    let user = await getUserDocument(firebaseUser.uid)
    if (!user) {
      user = await createUserDocument(firebaseUser)
    } else {
      await updateUserLastLogin(firebaseUser.uid)
    }
    
    return user
  } catch (error) {
    console.error('Google sign in error:', error)
    throw error
  }
}

// Facebook Sign In
export async function signInWithFacebook(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, facebookProvider)
    const firebaseUser = result.user
    
    let user = await getUserDocument(firebaseUser.uid)
    if (!user) {
      user = await createUserDocument(firebaseUser)
    } else {
      await updateUserLastLogin(firebaseUser.uid)
    }
    
    return user
  } catch (error) {
    console.error('Facebook sign in error:', error)
    throw error
  }
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = await getUserDocument(result.user.uid)
    if (user) {
      await updateUserLastLogin(result.user.uid)
    }
    return user
  } catch (error) {
    console.error('Email sign in error:', error)
    throw error
  }
}

// Email/Password Sign Up
export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = await createUserDocument(result.user)
    return user
  } catch (error) {
    console.error('Email sign up error:', error)
    throw error
  }
}

// Phone OTP - Setup Recaptcha
let recaptchaVerifier: RecaptchaVerifier | null = null

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    })
  }
  return recaptchaVerifier
}

// Phone OTP - Send Code
let confirmationResult: ConfirmationResult | null = null

export async function sendPhoneOtp(phoneNumber: string, containerId: string): Promise<void> {
  try {
    const verifier = setupRecaptcha(containerId)
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
  } catch (error) {
    console.error('Phone OTP send error:', error)
    // Reset recaptcha on error
    recaptchaVerifier = null
    throw error
  }
}

// Phone OTP - Verify Code
export async function verifyPhoneOtp(code: string): Promise<User | null> {
  try {
    if (!confirmationResult) {
      throw new Error('No confirmation result. Please request OTP first.')
    }
    
    const result = await confirmationResult.confirm(code)
    const firebaseUser = result.user
    
    let user = await getUserDocument(firebaseUser.uid)
    if (!user) {
      user = await createUserDocument(firebaseUser)
    } else {
      await updateUserLastLogin(firebaseUser.uid)
    }
    
    // Reset confirmation result
    confirmationResult = null
    recaptchaVerifier = null
    
    return user
  } catch (error) {
    console.error('Phone OTP verify error:', error)
    throw error
  }
}

// Password Reset
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Password reset error:', error)
    throw error
  }
}

// Sign Out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Auth State Observer
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

// Get Current User
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser
}
