const express = require('express')
const pool = require('../db')
const authenticateToken = require('../middleware/auth')

const router = express.Router()

// DELETE /api/comments/:id — delete your own comment (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found or not yours' })
    }
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/comments/:id/like — toggle like on a comment (protected)
router.post('/:id/like', authenticateToken, async (req, res) => {
  const commentId = req.params.id
  const userId = req.user.id

  try {
    const existing = await pool.query(
      'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    )

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      )
      return res.json({ liked: false })
    }

    await pool.query(
      'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
      [commentId, userId]
    )
    res.json({ liked: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
