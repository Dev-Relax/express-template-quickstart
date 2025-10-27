import { useState, useEffect, ReactNode } from "react"
import api from "../services/api"
import { User, AuthContextValue, ApiError } from "../types"
import { AxiosError } from "axios"
import { AuthContext } from "./useAuth"


/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication provider component
 * Manages user authentication state and operations
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches user profile from server
   */
  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/profile")
      setUser(response.data.user)
    } catch (err) {
      console.error("Failed to fetch profile:", err)
      // Don't set error here, as user might not be logged in
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Initialize: fetch profile if token exists
   */
  useEffect(() => {
    if (accessToken) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [accessToken])

  /**
   * Handles API errors and extracts error message
   */
  const handleError = (err: unknown): string => {
    const axiosError = err as AxiosError<ApiError>

    if (axiosError.response?.data) {
      const data = axiosError.response.data

      // Handle validation errors
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map((e) => e.message).join(", ")
      }

      // Handle single error message
      if (data.error) {
        return data.error
      }
    }

    return "An error occurred. Please try again."
  }

  /**
   * Registers a new user
   */
  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await api.post("/auth/register", { email, password, name })

      const { accessToken: token, user: userData } = response.data

      // Store token and user data
      localStorage.setItem("accessToken", token)
      setAccessToken(token)
      setUser(userData)
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logs in an existing user
   */
  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await api.post("/auth/login", { email, password })

      const { accessToken: token, user: userData } = response.data

      // Store token and user data
      localStorage.setItem("accessToken", token)
      setAccessToken(token)
      setUser(userData)
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logs out the current user
   */
  const logout = async () => {
    try {
      setError(null)
      await api.post("/auth/logout")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Clear local state regardless of API result
      localStorage.removeItem("accessToken")
      setAccessToken(null)
      setUser(null)
    }
  }

  /**
   * Updates user profile
   */
  const updateProfile = async (name?: string, email?: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await api.put("/user/profile", { name, email })
      setUser(response.data.user)
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Updates user password
   */
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null)
      setIsLoading(true)

      await api.put("/user/password", { currentPassword, newPassword })

      // Clear tokens as password change invalidates all sessions
      localStorage.removeItem("accessToken")
      setAccessToken(null)
      setUser(null)
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Deletes user account
   */
  const deleteAccount = async (password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      await api.delete("/users/account", { data: { password } })

      // Clear local state
      localStorage.removeItem("accessToken")
      setAccessToken(null)
      setUser(null)
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refreshes access token
   */
  const refreshToken = async () => {
    try {
      const response = await api.post("/users/refresh")
      const token = response.data.accessToken

      localStorage.setItem("accessToken", token)
      setAccessToken(token)
    } catch (err) {
      console.error("Token refresh failed:", err)
      localStorage.removeItem("accessToken")
      setAccessToken(null)
      setUser(null)
    }
  }

  /**
   * Clears error message
   */
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextValue = {
    user,
    accessToken,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    refreshToken,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

