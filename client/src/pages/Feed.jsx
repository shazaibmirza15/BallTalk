import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeed() {
      try {
        if (user.favourite_team) {
          const { data } = await api.get(`/posts/club/${encodeURIComponent(user.favourite_team)}`)
          setPosts(data)
        } else {
          const { data } = await api.get('/posts')
          setPosts(data.filter(p => p.club === null))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [user])

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const feedLabel = user.favourite_team
    ? `${user.favourite_team} posts`
    : 'Neutral posts (no club tag)'

  return (
    <section className="page">
      <h2>Your Feed</h2>
      <p className="feed-label">{feedLabel}</p>

      {loading ? <p>Loading...</p> : (
        posts.length === 0
          ? <p className="empty">No posts here yet.</p>
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
