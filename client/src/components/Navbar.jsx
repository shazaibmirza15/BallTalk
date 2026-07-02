import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <span className="navbar-brand">BallTalk</span>

      {user ? (
        <>
          <nav>
            <ul className="nav-links">
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/feed">Your Feed</NavLink></li>
              <li><NavLink to="/search">Search</NavLink></li>
              <li><NavLink to="/profile">Profile</NavLink></li>
            </ul>
          </nav>
          <div className="nav-user">
            <span className="nav-username"><span className="nav-at">@</span>{user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <nav>
          <ul className="nav-links">
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register">Register</NavLink></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
