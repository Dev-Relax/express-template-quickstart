import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"

/**
 * Axios instance configured for API calls
 */
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * CSRF token stored in memory
 */
let csrfToken: string | null = null

/**
 * Fetches CSRF token from server
 * @returns {Promise<string>} CSRF token
 */
export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken

  const response = await api.get("/auth/csrf-token")
  csrfToken = response.data.csrfToken
  return csrfToken as string
}

/**
 * Request interceptor to add CSRF token to protected requests
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add CSRF token for state-changing requests
    if (config.method && ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())) {
      const token = await getCsrfToken()
      config.headers["x-csrf-token"] = token
    }

    // Add access token if available
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const response = await axios.post("/api/users/refresh", {}, { withCredentials: true })
        const newAccessToken = response.data.accessToken

        // Store new token
        localStorage.setItem("accessToken", newAccessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
