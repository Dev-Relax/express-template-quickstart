import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AuthProvider } from "./contexts/AuthContext"
import { PrivateRoute } from "./components/PrivateRoute"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import "./App.css"
import { Dashboard } from "./pages/Dashboard"

/**
 * Main application component
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
