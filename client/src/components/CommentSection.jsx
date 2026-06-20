import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  // Track like state per comment id: { liked, count }
  const [likeState, setLikeState] = useState({})

  useEffect(() => {
    async function fetchComments() {
      try {
        const { data } = await api.get(`/posts/${postId}/comments`)
        setComments(data)
        const initial = {}
        data.forEach(c => { initial[c.id] = { liked: false, count: c.like_count } })
        setLikeState(initial)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [postId])

  async function handleAddComment(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content })
      const newComment = { ...data, like_count: 0 }
      setComments(prev => [...prev, newComment])
      setLikeState(prev => ({ ...prev, [data.id]: { liked: false, count: 0 } }))
      setContent('')
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  async function handleLike(commentId) {
    try {
      const { data } = await api.post(`/comments/${commentId}/like`)
      setLikeState(prev => ({
        ...prev,
        [commentId]: {
          liked: data.liked,
          count: data.liked ? prev[commentId].count + 1 : prev[commentId].count - 1,
        },
      }))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      console.error(err)
    }
  }

  const sorted = [...comments].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    const aLikes = likeState[a.id]?.count ?? a.like_count
    const bLikes = likeState[b.id]?.count ?? b.like_count
    return bLikes - aLikes
  })

  return (
    <section className="comment-section" onClick={e => e.stopPropagation()}>
      <div className="comment-sort">
        <button
          className={sort === 'newest' ? 'tab active' : 'tab'}
          onClick={() => setSort('newest')}
        >
          Newest
        </button>
        <button
          className={sort === 'most_liked' ? 'tab active' : 'tab'}
          onClick={() => setSort('most_liked')}
        >
          Most Liked
        </button>
      </div>

      <form className="comment-form" onSubmit={handleAddComment}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button type="submit" disabled={posting}>
          {posting ? '...' : 'Post'}
        </button>
      </form>

      {loading ? (
        <p className="comment-empty">Loading comments...</p>
      ) : sorted.length === 0 ? (
        <p className="comment-empty">No comments yet. Be the first!</p>
      ) : (
        <ul className="comment-list">
          {sorted.map(comment => {
            const ls = likeState[comment.id] ?? { liked: false, count: comment.like_count }
            return (
              <li key={comment.id} className="comment-item">
                <header className="comment-meta">
                  <span className="comment-username">@{comment.username}</span>
                  <time className="comment-time" dateTime={comment.created_at}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </header>
                <p className="comment-content">{comment.content}</p>
                <footer className="comment-actions">
                  <button
                    className={`like-btn ${ls.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(comment.id)}
                  >
                    ♥ {ls.count}
                  </button>
                  {user?.username === comment.username && (
                    <button className="delete-btn" onClick={() => handleDelete(comment.id)}>
                      Delete
                    </button>
                  )}
                </footer>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
