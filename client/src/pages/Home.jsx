import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { CLUBS } from '../constants/clubs'

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [club, setClub] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent')

  async function fetchPosts() {
    try {
      const { data } = await api.get('/posts')
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    setError('')
    try {
      await api.post('/posts', { content, club: club || null })
      setContent('')
      setClub('')
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const sorted = [...posts].sort((a, b) =>
    sort === 'recent'
      ? new Date(b.created_at) - new Date(a.created_at)
      : b.like_count - a.like_count
  )

  return (
    <section className="page">
      <form className="post-form" onSubmit={handlePost}>
        <p className="post-form-label">Wanna spread some ball knowledge, {user.username}?</p>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          required
        />
        <div className="post-form-row">
          <select value={club} onChange={e => setClub(e.target.value)}>
            <option value="">No club tag</option>
            {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" disabled={posting}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="tab-bar">
        <button className={sort === 'recent' ? 'tab active' : 'tab'} onClick={() => setSort('recent')}>
          Most Recent
        </button>
        <button className={sort === 'liked' ? 'tab active' : 'tab'} onClick={() => setSort('liked')}>
          Most Liked
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        sorted.length === 0
          ? <p className="empty">No posts yet. Be the first!</p>
          : <ul className="post-list">
              {sorted.map(post => (
                <li key={post.id}>
                  <PostCard post={post} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
      )}
    </section>
  )
}
