const express = require('express')
const pool = require('../db')
const authenticateToken = require('../middleware/auth')

const router = express.Router()

const POST_SELECT = `
  SELECT
    p.id,
    p.content,
    p.club,
    p.created_at,
    u.username,
    u.favourite_team,
    COUNT(DISTINCT l.id)::int AS like_count,
    COUNT(DISTINCT c.id)::int AS comment_count
  FROM posts p
  JOIN users u ON u.id = p.user_id
  LEFT JOIN likes l ON l.post_id = p.id
  LEFT JOIN comments c ON c.post_id = p.id
`

// GET /api/posts — global timeline
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `${POST_SELECT} GROUP BY p.id, u.username, u.favourite_team ORDER BY p.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/posts/club/:club — posts filtered by club
router.get('/club/:club', async (req, res) => {
  try {
    const result = await pool.query(
      `${POST_SELECT} WHERE p.club = $1 GROUP BY p.id, u.username, u.favourite_team ORDER BY p.created_at DESC`,
      [req.params.club]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/posts — create a post (protected)
router.post('/', authenticateToken, async (req, res) => {
  const { content, club } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'content is required' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content, club) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, content.trim(), club || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/posts/:id — delete your own post (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found or not yours' })
    }
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/posts/:id/like — toggle like (protected)
router.post('/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id
  const userId = req.user.id

  try {
    const existing = await pool.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId])
      return res.json({ liked: false })
    }

    await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId])
    res.json({ liked: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/posts/:id/comments — get comments on a post (with like counts)
router.get('/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.username,
              COUNT(cl.id)::int AS like_count
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN comment_likes cl ON cl.comment_id = c.id
       WHERE c.post_id = $1
       GROUP BY c.id, u.username
       ORDER BY c.created_at ASC`,
      [req.params.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/posts/:id/comments — add a comment (protected)
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'content is required' })
  }

  try {
    const post = await pool.query('SELECT id FROM posts WHERE id = $1', [req.params.id])
    if (post.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [req.params.id, req.user.id, content.trim()]
    )

    res.status(201).json({ ...result.rows[0], username: req.user.username })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
