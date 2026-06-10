const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, favourite_team } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  // favourite_team must be explicitly included: null (neutral) or a non-empty string (team name)
  if (!('favourite_team' in req.body)) {
    return res.status(400).json({ error: 'favourite_team is required — provide a team name or null for neutral' })
  }

  const team = favourite_team === null ? null : (typeof favourite_team === 'string' ? favourite_team.trim() : null)

  if (favourite_team !== null && !team) {
    return res.status(400).json({ error: 'favourite_team must be a valid team name or null for neutral' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (username, email, password, favourite_team) VALUES ($1, $2, $3, $4) RETURNING id, username, email, favourite_team, created_at',
      [username, email, hashedPassword, team]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(201).json({ user, token })
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint.includes('email') ? 'email' : 'username'
      return res.status(409).json({ error: `That ${field} is already taken` })
    }
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  try {
    const result = await pool.query('SELECT id, username, email, favourite_team, created_at, password FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
