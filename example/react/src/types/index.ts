/**
 * User data interface
 */
export interface User {
  id: string
  email: string
  name: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (name?: string, email?: string) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
}

/**
 * API error response interface
 */
export interface ApiError {
  error?: string
  errors?: Array<{ field: string; message: string }>
}
