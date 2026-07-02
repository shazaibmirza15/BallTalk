import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import CLUBS_CONFIG from '../constants/clubs'

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
    : 'Neutral posts'

  const club = user.favourite_team ? CLUBS_CONFIG[user.favourite_team] : null

  return (
    <section className="page">
      <p
        className="feed-label"
        style={club ? {
          color: club.primary,
          background: club.secondary,
          border: `1px solid ${club.primary}`,
        } : undefined}
      >{feedLabel}</p>

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
