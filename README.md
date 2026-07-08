# BallTalk

🌐 Live site: https://ball-talk-three.vercel.app
🔧 API: https://balltalk-devq.onrender.com

A football social app where fans can post, comment, and interact with content tied to their favourite Premier League club. Users declare a team allegiance on registration (or choose to be neutral) and get a personalised feed based on that choice.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Axios |
| Build tool | Vite |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Dev server | Nodemon |

---

## Features

### Authentication
- Register with username, email, password, and team allegiance
- Team supporters complete a **Pledge page** — they must type `I LOVE [TEAM NAME]` exactly before their account is created
- Neutral users skip the pledge and register directly
- Login issues a JWT valid for 7 days
- All protected routes redirect unauthenticated users to Login

### Posts
- Create posts with optional club tags (tied to a Premier League club)
- Global timeline on the Home page showing all posts
- Like / unlike posts (toggle)
- Delete your own posts
- Each post displays the author's username, team allegiance badge, club tag, like count, and comment count

### Your Feed
- Team supporters see posts tagged to their club
- Neutral users see posts with no club tag
- Personalised automatically based on the user's registered allegiance

### Comments
- Click any post to expand its comment section inline
- Add, like/unlike, and delete your own comments
- Sort comments by **Newest** or **Most Liked**

### Search
- Search posts by keyword (content match)
- Search users by username
- Tabbed results view switching between Posts and Users

### Profile
- Displays account info: username, email, favourite team
- Lists all of the logged-in user's own posts

---

## Project Structure

```
BallTalk/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── api/
│       │   └── axios.js         # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── CommentSection.jsx
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx
│       │   └── ProtectedRoute.jsx
│       ├── constants/
│       │   └── clubs.js         # 2026/27 Premier League clubs
│       ├── context/
│       │   └── AuthContext.jsx  # Auth state, login/register/logout
│       └── pages/
│           ├── Feed.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Pledge.jsx
│           ├── Profile.jsx
│           ├── Register.jsx
│           └── Search.jsx
└── server/                  # Express backend
    ├── middleware/
    │   └── auth.js              # JWT verification middleware
    ├── migrations/
    │   ├── 001_users.sql
    │   ├── 002_users_add_favourite_team.sql
    │   ├── 003_posts_comments_likes.sql
    │   └── 004_comment_likes.sql
    ├── routes/
    │   ├── auth.js
    │   ├── comments.js
    │   ├── posts.js
    │   └── users.js
    ├── db.js                    # PostgreSQL connection pool
    ├── index.js                 # Express app entry point
    └── scripts/
        └── setup-db.js          # One-time DB creation + migration runner
```

---

## Database Schema

### `users`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(30) | UNIQUE NOT NULL |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| favourite_team | VARCHAR(100) | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `posts`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | FK → users(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL |
| club | VARCHAR(100) | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `comments`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| post_id | INTEGER | FK → posts(id) ON DELETE CASCADE |
| user_id | INTEGER | FK → users(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `likes`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| post_id | INTEGER | FK → posts(id) ON DELETE CASCADE |
| user_id | INTEGER | FK → users(id) ON DELETE CASCADE |
| — | — | UNIQUE(post_id, user_id) |

### `comment_likes`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| comment_id | INTEGER | FK → comments(id) ON DELETE CASCADE |
| user_id | INTEGER | FK → users(id) ON DELETE CASCADE |
| — | — | UNIQUE(comment_id, user_id) |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (running locally)

### 1. Clone the repo

```bash
git clone https://github.com/shazaibmirza15/BallTalk.git
cd BallTalk
```

### 2. Configure environment

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost/BallTalk
JWT_SECRET=your_secret_key
```

### 3. Set up the database

```bash
cd server
npm install
node scripts/setup-db.js
```

This creates the `BallTalk` database and runs all four migrations automatically.

### 4. Start the backend

```bash
npm run dev     # runs on http://localhost:5000
```

### 5. Start the frontend

```bash
cd ../client
npm install
npm run dev     # runs on http://localhost:5173
```

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a JWT |

**Register body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string (min 6 chars)",
  "favourite_team": "string | null"
}
```

`favourite_team` must be explicitly provided. Pass `null` for neutral users or a club name string for supporters. Omitting the field entirely returns a 400 error.

---

### Posts — `/api/posts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | No | Global timeline (all posts, newest first) |
| GET | `/api/posts/club/:club` | No | Posts filtered by club tag |
| POST | `/api/posts` | Yes | Create a post |
| DELETE | `/api/posts/:id` | Yes | Delete your own post |
| POST | `/api/posts/:id/like` | Yes | Toggle like / unlike on a post |
| GET | `/api/posts/:id/comments` | No | Get all comments on a post |
| POST | `/api/posts/:id/comments` | Yes | Add a comment to a post |

Timeline responses include `username`, `favourite_team`, `like_count`, and `comment_count` joined from related tables.

---

### Comments — `/api/comments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| DELETE | `/api/comments/:id` | Yes | Delete your own comment |
| POST | `/api/comments/:id/like` | Yes | Toggle like / unlike on a comment |

---

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/search?q=` | No | Search users by username |

---

## Key Design Decisions

- **Ownership enforced in SQL** — delete queries include `AND user_id = $n`, so attempting to delete another user's content returns 0 rows and a 404, with no separate ownership check needed in application code.
- **Unique constraints at DB level** — `UNIQUE(post_id, user_id)` on `likes` and `UNIQUE(comment_id, user_id)` on `comment_likes` prevent double-liking at the database layer, not just in app code.
- **Cascade deletes** — deleting a user removes their posts; deleting a post removes its comments and likes; deleting a comment removes its likes.
- **JWT stored in localStorage** — attached to every request via an Axios request interceptor, so individual route files never handle token logic.
- **Pledge flow uses React Router state** — form data is passed to the Pledge page via `navigate('/pledge', { state })` and returned via the same mechanism if the user goes back, so nothing is stored in a context or session.
