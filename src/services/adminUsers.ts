import axios from 'axios'
import type { AxiosInstance } from 'axios'
/**
 * Admin Users Service
 * Handles all user management API calls
 * (list, create, update role, update status)
 */

export interface AdminUser {
  id: string
  uid?: string
  email: string
  full_name: string
  role: string
  badge_number?: string
  is_active?: boolean
  created_at?: any
}

export interface CreateUserPayload {
  email: string
  password: string
  full_name: string
  role: string
  badge_number?: string
}

class AdminUsersService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api/admin',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Attach token automatically
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<AdminUser[]> {
    const res = await this.api.get('/users')
    return res.data.users
  }

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<any> {
    const res = await this.api.post('/users', payload)
    return res.data
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: string): Promise<any> {
    const res = await this.api.patch(`/users/${userId}/role`, {
      role,
    })
    return res.data
  }

  /**
   * Toggle user active status
   */
  async updateStatus(userId: string, is_active: boolean): Promise<any> {
    const res = await this.api.patch(`/users/${userId}/status`, {
      is_active,
    })
    return res.data
  }

  /**
   * Delete user (optional future use)
   */
  async deleteUser(userId: string): Promise<any> {
    const res = await this.api.delete(`/users/${userId}`)
    return res.data
  }
}

// Export singleton instance (important)
export const adminUsersService = new AdminUsersService()