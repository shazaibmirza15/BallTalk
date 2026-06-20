import { useState } from 'react'
import api from '../api/axios'
import PostCard from '../components/PostCard'

export default function Search() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('posts') // 'posts' | 'users'
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts'),
        api.get(`/users/search?q=${encodeURIComponent(query.trim())}`),
      ])
      const filtered = postsRes.data.filter(p =>
        p.content.toLowerCase().includes(query.trim().toLowerCase())
      )
      setPosts(filtered)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <section className="page">
      <h2>Search</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search posts or users..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {searched && (
        <>
          <div className="tab-bar">
            <button className={tab === 'posts' ? 'tab active' : 'tab'} onClick={() => setTab('posts')}>
              Posts ({posts.length})
            </button>
            <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>
              Users ({users.length})
            </button>
          </div>

          {loading ? <p>Searching...</p> : (
            tab === 'posts' ? (
              posts.length === 0
                ? <p className="empty">No posts match "{query}"</p>
                : <ul className="post-list">
                    {posts.map(post => (
                      <li key={post.id}>
                        <PostCard post={post} onDelete={handleDelete} />
                      </li>
                    ))}
                  </ul>
            ) : (
              users.length === 0
                ? <p className="empty">No users match "{query}"</p>
                : <ul className="user-list">
                    {users.map(u => (
                      <li key={u.id} className="user-card">
                        <span className="post-username">@{u.username}</span>
                        {u.favourite_team
                          ? <span className="badge team-badge">{u.favourite_team} fan</span>
                          : <span className="badge neutral-badge">Neutral</span>
                        }
                      </li>
                    ))}
                  </ul>
            )
          )}
        </>
      )}
    </section>
  )
}
