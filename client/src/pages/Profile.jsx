import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'

export default function Profile() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const { data } = await api.get('/posts')
        setPosts(data.filter(p => p.username === user.username))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyPosts()
  }, [user])

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <section className="page">
      <h2>Profile</h2>

      <section className="profile-card">
        <p><strong>Username:</strong> @{user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Favourite Team:</strong>{' '}
          {user.favourite_team || <span className="badge neutral-badge">Neutral</span>}
        </p>
      </section>

      <h3>Your Posts</h3>
      {loading ? <p>Loading...</p> : (
        posts.length === 0
          ? <p className="empty">You haven't posted yet.</p>
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
