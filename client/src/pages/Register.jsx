import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CLUBS from '../constants/clubs'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Restore state if returning from the Pledge page
  const restored = location.state || {}

  const [form, setForm] = useState({
    username: restored.formData?.username || '',
    email: restored.formData?.email || '',
    password: restored.formData?.password || '',
    confirmPassword: restored.formData?.confirmPassword || '',
  })
  const [teamChoice, setTeamChoice] = useState(restored.teamChoice || 'neutral')
  const [selectedTeam, setSelectedTeam] = useState(restored.selectedTeam || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (teamChoice === 'pick' && !selectedTeam) {
      return setError('Please select your favourite team')
    }

    // Neutral users register directly; team supporters go to the Pledge page
    if (teamChoice === 'pick') {
      return navigate('/pledge', {
        state: {
          formData: { ...form },
          selectedTeam,
        },
      })
    }

    setLoading(true)
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        favourite_team: null,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1>BallTalk</h1>
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Username
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>Confirm Password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
          </label>

          <fieldset className="team-fieldset">
            <legend>Do you support a team?</legend>
            <label className="radio-label">
              <input type="radio" value="neutral" checked={teamChoice === 'neutral'}
                onChange={() => setTeamChoice('neutral')} />
              I'm Neutral
            </label>
            <label className="radio-label">
              <input type="radio" value="pick" checked={teamChoice === 'pick'}
                onChange={() => setTeamChoice('pick')} />
              Pick my team
            </label>
            {teamChoice === 'pick' && (
              <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} required>
                <option value="">-- Select a team --</option>
                {CLUBS.map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
            )}
          </fieldset>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </div>
  )
}
