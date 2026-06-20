import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Pledge() {
  const { register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { formData, selectedTeam } = location.state || {}

  const [pledge, setPledge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Guard: if arrived here without registration state, send back
  if (!formData || !selectedTeam) {
    return <Navigate to="/register" replace />
  }

  const expected = `I LOVE ${selectedTeam.toUpperCase()}`

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (pledge !== expected) {
      return setError(`Must be exactly: ${expected}`)
    }

    setLoading(true)
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        favourite_team: selectedTeam,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    navigate('/register', {
      state: { formData, selectedTeam, teamChoice: 'pick' },
    })
  }

  return (
    <div className="pledge-page">
      <section className="pledge-card">
        <p className="pledge-eyebrow">You selected</p>
        <h1 className="pledge-club">{selectedTeam}</h1>
        <p className="pledge-instruction">
          Prove your loyalty. Type the following exactly:
        </p>
        <p className="pledge-expected">{expected}</p>

        <form onSubmit={handleSubmit}>
          <input
            className="pledge-input"
            type="text"
            placeholder={expected}
            value={pledge}
            onChange={e => setPledge(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {error && <p className="error">{error}</p>}
          <button className="pledge-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>

        <button className="pledge-back" onClick={handleBack}>
          ← Change my team
        </button>
      </section>
    </div>
  )
}
