import { useEffect, useState } from 'react'
import api from '../api/axios'
import PostCard from '../components/PostCard'
import CLUBS from '../constants/clubs'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [club, setClub] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <section className="page">
      <h2>Home</h2>

      <form className="post-form" onSubmit={handlePost}>
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

      {loading ? <p>Loading...</p> : (
        posts.length === 0
          ? <p className="empty">No posts yet. Be the first!</p>
          : <ul className="post-list">
              {posts.map(post => (
                <li key={post.id}>
                  <PostCard post={post} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
      )}
    </section>
  )
}
