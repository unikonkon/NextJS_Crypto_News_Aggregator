import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthData {
  user: User
  session: Session
}

// Cookie utilities
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
}

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`
}

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  
  // Set cookie on successful login
  if (data.user && data.session) {
    const authData: AuthData = {
      user: data.user,
      session: data.session
    }
    setCookie('userlogin', JSON.stringify(authData), 7)
  }
  
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  // Clear cookie
  deleteCookie('userlogin')
  
  if (error) throw error
}

export const getCurrentUser = (): AuthData | null => {
  const userlogin = getCookie('userlogin')
  if (!userlogin) return null
  
  try {
    return JSON.parse(userlogin)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser()
  return !!user?.user && !!user?.session
} 