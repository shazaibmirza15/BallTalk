import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CLUBS_CONFIG, { CLUBS } from '../constants/clubs'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const restored = location.state || {}

  const [form, setForm] = useState({
    username: restored.formData?.username || '',
    email: restored.formData?.email || '',
    password: restored.formData?.password || '',
    confirmPassword: restored.formData?.confirmPassword || '',
  })
  const [teamChoice, setTeamChoice] = useState(restored.teamChoice || 'neutral')
  const [selectedTeam, setSelectedTeam] = useState(restored.selectedTeam || '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

    if (teamChoice === 'pick') {
      return navigate('/pledge', {
        state: { formData: { ...form }, selectedTeam },
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
        <h1 className="auth-brand">BallTalk</h1>
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

          <div className="team-choice">
            <span className="team-choice-label">Do you support a team?</span>
            <div className="radio-row">
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
            </div>
          </div>

          {teamChoice === 'pick' && (
            <div className="club-select">
              {dropdownOpen && (
                <div className="club-select-backdrop" onClick={() => setDropdownOpen(false)} />
              )}
              <button
                type="button"
                className="club-select-trigger"
                onClick={() => setDropdownOpen(o => !o)}
              >
                {selectedTeam
                  ? <span style={{ color: CLUBS_CONFIG[selectedTeam]?.primary }}>{selectedTeam}</span>
                  : '-- Select a team --'
                }
                <span className="club-select-arrow">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <ul className="club-select-list">
                  {CLUBS.map(club => {
                    const c = CLUBS_CONFIG[club]
                    return (
                      <li
                        key={club}
                        className="club-select-option"
                        style={{ background: c.primary, color: c.text, borderLeft: `4px solid ${c.secondary}` }}
                        onClick={() => { setSelectedTeam(club); setDropdownOpen(false) }}
                      >
                        {club}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </div>
  )
}
