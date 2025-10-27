import { createContext, useContext } from "react"
import { AuthContextValue } from "../types"

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
