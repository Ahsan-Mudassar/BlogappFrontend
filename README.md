# Marginalia — Full-Stack Blog App

A full-stack blogging platform where users can read, write, edit, and manage blog posts. Built with a React frontend and an Express + MongoDB backend, secured with JWT-based authentication.

Design concept: **"Marginalia"** — a notebook / pen-stroke aesthetic.

| Element | Value |
|---|---|
| Canvas | `#EDEBE4` |
| Ink | `#22262B` |
| Pen | `#2F6F4E` |

---

## Features

- Public blog reading — no login required
- Create, edit, and delete blog posts (authenticated users)
- JWT authentication with access + refresh tokens
- Automatic token refresh with request queuing (no duplicate refresh calls on concurrent 401s)
- OTP-based forgot/reset password via Nodemailer
- Secure two-step change-password flow
- Image uploads via Multer + Cloudinary
- User dashboard with stats, recent blogs, and quick links
- "My Blogs" management view with inline delete confirmation
- Private blog visibility — planned as an optional future feature

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Axios (with interceptors for auth)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (access & refresh tokens)
- Multer + Cloudinary (image uploads)
- Nodemailer (OTP emails)

---

## Project Structure

```
.
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # BlogCard, Navbar, Sidebar, ConfirmDialog, etc.
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useAuth
│   │   ├── pages/          # Home, Login, Register, Dashboard, Settings, etc.
│   │   └── lib/            # axios instance, token store
│   └── ...
└── server/                 # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── ...
```

---

## Authentication Architecture

- **Access token** is kept in-memory (module-level token store), *not* in React state, so non-React code (like the Axios instance) can access it directly.
- **Refresh token** is stored in an httpOnly cookie.
- Login, register, and refresh-token endpoints are excluded from the 401-retry-refresh interceptor logic, so invalid-credential errors surface correctly instead of triggering a refresh loop.
- Concurrent 401 responses are queued during a single in-flight refresh call to avoid firing multiple simultaneous refresh requests.
- Session expiry is handled via a custom `auth:session-expired` window event (rather than a hard redirect) to preserve SPA state.
- `PrivateRoute` checks a loading flag before redirecting, avoiding a false-redirect flicker on page refresh.
- Login errors show a single generic "email or password is wrong" message for both bad password and unknown email, to prevent user enumeration.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)
- SMTP credentials (for Nodemailer OTP emails)

### 1. Clone the repository

```bash
git clone https://github.com/Ahsan-Mudassar/BlogappFrontend.git
cd BlogappFrontend
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

The client will typically run on `http://localhost:5173` and the server on `http://localhost:5000` (adjust as needed).

---

## Routes Overview

**Public**
- `/` — All blogs
- `/blogs/:id` — Blog detail
- `/login`, `/register`, `/forgot-password`

**Private** *(requires authentication)*
- `/dashboard`
- `/my-blogs`
- `/create-blog`
- `/edit-blog/:id`
- `/settings`
- `/change-password`

---

## Roadmap

- [ ] Private blog visibility toggle (optional, per-blog)
- [ ] Comments / likes
- [ ] Search & tag filtering

---

## Author

**Ahsan Mudassar**
- GitHub: [@Ahsan-Mudassar](https://github.com/Ahsan-Mudassar)

---

## License

This project is licensed under the MIT License.