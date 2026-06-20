const express = require('express')
const pool = require('../db')

const router = express.Router()

// GET /api/users/search?q= — search users by username
router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q || !q.trim()) return res.json([])

  try {
    const result = await pool.query(
      'SELECT id, username, favourite_team FROM users WHERE username ILIKE $1 LIMIT 20',
      [`%${q.trim()}%`]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
