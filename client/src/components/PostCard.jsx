import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import CommentSection from './CommentSection'
import CLUBS_CONFIG from '../constants/clubs'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count)

  async function handleLike(e) {
    e.stopPropagation()
    try {
      const { data } = await api.post(`/posts/${post.id}/like`)
      setLiked(data.liked)
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${post.id}`)
      onDelete(post.id)
    } catch (err) {
      console.error(err)
    }
  }

  function handleCommentAdded() {
    setCommentCount(prev => prev + 1)
  }

  const isOwner = user?.username === post.username

  return (
    <article
      className={`post-card ${expanded ? 'expanded' : ''} ${isOwner ? 'own-post' : ''}`}
      onClick={() => setExpanded(prev => !prev)}
      style={{ cursor: 'pointer' }}
    >
      <header className="post-meta">
        <span className="post-username">@{post.username}</span>
        {post.favourite_team
          ? <span className="badge team-badge">{post.favourite_team} fan</span>
          : <span className="badge neutral-badge">Neutral</span>
        }
        {post.club && (() => {
          const c = CLUBS_CONFIG[post.club]
          return (
            <span
              className="badge club-badge"
              style={c ? { background: c.primary, color: c.text, border: `1px solid ${c.secondary}` } : undefined}
            >
              {post.club}
            </span>
          )
        })()}
        <time className="post-time" dateTime={post.created_at}>
          {new Date(post.created_at).toLocaleDateString()}
        </time>
      </header>

      <p className="post-content">{post.content}</p>

      <footer className="post-actions">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          ♥ {likeCount}
        </button>
        <button
          className={`comment-btn ${expanded ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); setExpanded(prev => !prev) }}
        >
          💬 {commentCount}
        </button>
        {isOwner && (
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        )}
      </footer>

      {expanded && <CommentSection postId={post.id} onCommentAdded={handleCommentAdded} />}
    </article>
  )
}
