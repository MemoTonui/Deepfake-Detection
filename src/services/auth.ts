// src/services/auth.ts
import { ref } from 'vue'

interface User {
  email: string
  uid: string
  role: string
  token: string
  refresh_token: string
  displayName?: string
  photoURL?: string
}

const user = ref<User | null>(null)

export function useAuth() {
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://deepfake-detection-backend-chi.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      user.value = {
        email: data.email,
        uid: data.uid,
        role: data.role,
        token: data.token,
        refresh_token: data.refresh_token,
        
      }

      // Store tokens in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('refresh_token', data.refresh_token)

      return data   // <-- return to the component, no router here
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    full_name: string
    badge_number?: string
    role: string
  }) => {
    try {
      const response = await fetch('https://deepfake-detection-backend-chi.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    // ⚠️ don't use router here either, let the component handle redirection
  }

  return { user, login, register, logout }
}
