# 📈 RiseN — Stock Market Simulator

A full-stack stock market simulation platform that lets users **sign up, track Indian stocks (NSE), manage a portfolio, set watchlists, and view transaction history** — all in real time.

**🌐 Live Demo:** [your-app.vercel.app](https://your-app.vercel.app)  
**🔗 Backend API:** [your-backend.onrender.com](https://your-backend.onrender.com)

---

## ✨ Features

- 🔐 **Authentication** — Secure JWT-based signup & login
- 📊 **Dashboard** — Live portfolio value, P&L, and performance charts
- 🏪 **Markets** — Browse 12+ NSE stocks with live pricing (with fallback data)
- 💼 **Portfolio** — Buy & sell stocks, track holdings
- 📋 **Transactions** — Full history of all trades
- ⭐ **Watchlist** — Save stocks for quick access
- 👤 **Profile** — View stats, change password

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Recharts, TailwindCSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + Bcrypt |
| Stock Data | NSE India API + Fallback prices |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd backend
npm install
# copy .env.example → .env and fill in values
cp .env.example .env
npm start
```

### Frontend
```bash
cd frontend
npm install
# copy .env.example → .env and fill in values
cp .env.example .env
npm start
```

---

## 🌍 Deployment

**Backend → [Render](https://render.com)**
- New Web Service → Connect GitHub repo → Set root directory to `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example`

**Frontend → [Vercel](https://vercel.com)**
- Import GitHub repo → Set root directory to `frontend`
- Add `REACT_APP_API_URL=https://your-backend.onrender.com/api`

---

## 📁 Project Structure

```
stockproject/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── api/         # Axios instances & API calls
    │   ├── components/  # Reusable UI components
    │   ├── context/     # AuthContext (global state)
    │   └── pages/       # Route pages
    └── vercel.json      # Vercel SPA routing config
```

---

## 🔑 Environment Variables

### Backend (`.env`)
| Variable | Description |
|---|---|
| `MONGO_DB_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `FRONTEND_URL` | Vercel frontend URL (for CORS) |
| `PORT` | Server port (default: 5000) |

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

*Built as a Full Stack Developer Internship assignment.*
