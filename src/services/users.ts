import axios from 'axios'

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  badge_number?: string
  is_active?: boolean
  created_at?: string
}

const API_URL = 'http://localhost:5000/api'

function authHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }
}

/**
 * Fetch all users (Admin only)
 */
export async function getUsers(): Promise<User[]> {
  const res = await axios.get(`${API_URL}/admin/users`, {
    headers: authHeader(),
  })

  return res.data.users || []
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
  return axios.patch(
    `${API_URL}/admin/users/${userId}/role`,
    { role },
    { headers: authHeader() }
  )
}

/**
 * Toggle active status
 */
export async function toggleUserStatus(userId: string, is_active: boolean) {
  return axios.patch(
    `${API_URL}/admin/users/${userId}/status`,
    { is_active },
    { headers: authHeader() }
  )
}

/**
 * Create user
 */
export async function createUser(payload: {
  full_name: string
  email: string
  role: string
  badge_number?: string
  password: string
}) {
  return axios.post(
    `${API_URL}/admin/users`,
    payload,
    { headers: authHeader() }
  )
}