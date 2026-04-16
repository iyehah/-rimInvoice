import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  type User as FirebaseUser,
} from 'firebase/firestore'
import { db } from './config'
import type { User, BusinessProfile } from '@/types/user'
import type { Invoice } from '@/types/invoice'

// ==================== USER OPERATIONS ====================

export async function createUserDocument(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid)
  
  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role: 'user',
    isPremium: false,
    isEnabled: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    invoiceCount: 0,
  }
  
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  })
  
  return userData
}

export async function getUserDocument(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    const data = userSnap.data()
    return {
      ...data,
      uid: userSnap.id,
      role: 'user' as const,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt,
    } as User
  }
  
  return null
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  })
}

export async function updateUserProfile(uid: string, profile: BusinessProfile): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { profile })
}

export async function updateUserPreferences(uid: string, preferences: Partial<User['preferences']>): Promise<void> {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  const currentPrefs = userSnap.data()?.preferences || {}
  
  await updateDoc(userRef, {
    preferences: { ...currentPrefs, ...preferences },
  })
}

// ==================== INVOICE OPERATIONS ====================

export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<string> {
  const invoicesRef = collection(db, 'invoices')
  const invoiceRef = doc(invoicesRef)
  
  await setDoc(invoiceRef, {
    ...invoice,
    createdAt: serverTimestamp(),
  })
  
  // Increment user invoice count
  const userRef = doc(db, 'users', invoice.userId)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    const currentCount = userSnap.data().invoiceCount || 0
    await updateDoc(userRef, { invoiceCount: currentCount + 1 })
  }
  
  return invoiceRef.id
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const invoiceRef = doc(db, 'invoices', invoiceId)
  const invoiceSnap = await getDoc(invoiceRef)
  
  if (invoiceSnap.exists()) {
    const data = invoiceSnap.data()
    return {
      ...data,
      id: invoiceSnap.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    } as Invoice
  }
  
  return null
}

export async function getUserInvoices(userId: string, limitCount = 50): Promise<Invoice[]> {
  const invoicesRef = collection(db, 'invoices')
  const q = query(
    invoicesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    } as Invoice
  })
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<void> {
  const invoiceRef = doc(db, 'invoices', invoiceId)
  await updateDoc(invoiceRef, updates)
}

export async function deleteInvoice(invoiceId: string, userId: string): Promise<void> {
  const invoiceRef = doc(db, 'invoices', invoiceId)
  await deleteDoc(invoiceRef)
  
  // Decrement user invoice count
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    const currentCount = userSnap.data().invoiceCount || 0
    await updateDoc(userRef, { invoiceCount: Math.max(0, currentCount - 1) })
  }
}

// ==================== CONFIG OPERATIONS ====================

export async function getSystemConfig(configKey: string): Promise<Record<string, unknown> | null> {
  const configRef = doc(db, 'config', configKey)
  const configSnap = await getDoc(configRef)
  
  if (configSnap.exists()) {
    return configSnap.data() as Record<string, unknown>
  }
  
  return null
}

export async function updateSystemConfig(configKey: string, data: Record<string, unknown>): Promise<void> {
  const configRef = doc(db, 'config', configKey)
  await setDoc(configRef, data, { merge: true })
}
