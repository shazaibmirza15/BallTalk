import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token'))

  function persist(userData, jwt) {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwt)
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data.user, data.token)
    return data
  }

  async function register(fields) {
    const { data } = await api.post('/auth/register', fields)
    persist(data.user, data.token)
    return data
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
