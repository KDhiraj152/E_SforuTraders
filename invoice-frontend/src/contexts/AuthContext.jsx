import { useState, useCallback, useMemo } from 'react'
import API from '@/api/client'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(localStorage.getItem('user') || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await API.post('/api/auth/login', { username, password })
      const { token: newToken, username: loggedInUsername } = response.data

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', loggedInUsername || username)

      setToken(newToken)
      setUser(loggedInUsername || username)
      setIsAuthenticated(true)
      setLoading(false)

      return { success: true }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      token,
      user,
      loading,
      error,
      login,
      logout,
      setError,
    }),
    [isAuthenticated, token, user, loading, error, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
