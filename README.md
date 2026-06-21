# Lida Backend API

REST API for the Lida community organizing platform.

## Stack
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- PDFKit for report generation

## Local Development

```bash
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default 7d) |
| `CLIENT_URL` | Frontend URL for CORS |
| `NODE_ENV` | `production` or `development` |

## Deploying to Railway

1. Push this backend folder to a new GitHub repo (or a subfolder)
2. Go to [railway.app](https://railway.app) and create a new project
3. Connect your GitHub repo
4. Add a MongoDB plugin inside Railway
5. Set all environment variables in Railway dashboard
6. Railway auto-detects Node.js and deploys

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PATCH /api/auth/me` — Update profile

### Communities
- `GET /api/communities` — Search/explore
- `POST /api/communities` — Create community
- `GET /api/communities/:id` — Get community
- `POST /api/communities/:id/join` — Join community
- `PATCH /api/communities/:id` — Edit community (moderator)
- `GET /api/communities/:id/join-requests` — Pending requests (moderator)
- `POST /api/communities/:id/join-requests/:userId/approve` — Approve (moderator)
- `POST /api/communities/:id/join-requests/:userId/reject` — Reject (moderator)

### Posts
- `GET /api/posts/community/:communityId` — Get community feed
- `POST /api/posts` — Create post
- `POST /api/posts/:id/like` — Like/unlike
- `POST /api/posts/:id/comments` — Add comment
- `POST /api/posts/:id/report` — Report post
- `PATCH /api/posts/:id/hide` — Hide post (moderator)

### Issues
- `GET /api/issues/community/:communityId` — Get issues
- `GET /api/issues/:id` — Get single issue
- `POST /api/issues` — Create issue
- `POST /api/issues/:id/support` — Support/unsupport
- `POST /api/issues/:id/comments` — Comment on issue
- `PATCH /api/issues/:id/status` — Update status (moderator)
- `GET /api/issues/:id/report` — Download PDF report

### Polls
- `GET /api/polls/community/:communityId` — Get polls
- `POST /api/polls` — Create poll
- `POST /api/polls/:id/vote` — Cast vote
- `GET /api/polls/:id/my-vote` — Check if voted

### Announcements
- `GET /api/announcements/community/:communityId` — Get announcements
- `POST /api/announcements` — Post announcement (moderator)
- `PATCH /api/announcements/:id/pin` — Pin/unpin (moderator)
- `DELETE /api/announcements/:id` — Delete (moderator)

### Members
- `GET /api/members/community/:communityId` — List members
- `GET /api/members/my-communities` — My communities
- `GET /api/members/community/:communityId/my-membership` — My membership status
- `PATCH /api/members/:communityId/:userId/promote` — Promote to moderator
- `PATCH /api/members/:communityId/:userId/ban` — Ban member

### Admin
- `GET /api/admin/stats` — Platform stats
- `GET /api/admin/users` — All users
- `PATCH /api/admin/users/:id/suspend` — Suspend user
- `PATCH /api/admin/users/:id/unsuspend` — Unsuspend user
- `GET /api/admin/communities` — All communities
- `PATCH /api/admin/communities/:id/suspend` — Suspend community
- `GET /api/admin/flags` — Flagged content
- `PATCH /api/admin/flags/:id` — Review flag

## Default Seed Data

After first run, the database is seeded with:
- 3 sample communities (Eludun Residents, Lokogoma Neighbours, GRA Phase II)
- 3 sample issues (water outage, transformer failure, road flooding)
- Admin account: `admin@lida.ng` / `LidaAdmin2024!`
