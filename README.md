# Concert Ticketing App

A modern, fullstack web application for online concert ticketing, built with the latest technologies for a seamless user and admin experience.

---

## 🚀 Tech Stack

- **Frontend:** React.js (Vite, Context API, React Router, Tailwind CSS, DaisyUI)
- **Backend:** Python Flask (Blueprint, SQLAlchemy, Flask-JWT-Extended, Flask-CORS)
- **Database:** MySQL
- **PDF Generation:** Pillow, ReportLab
- **Authentication:** JWT (JSON Web Token)
- **State Management:** React Context
- **API Communication:** Axios
- **Styling:** Tailwind CSS, DaisyUI
- **Dev Tools:** ESLint, PostCSS, Vite

---

## ✨ Features
- User registration & login with JWT authentication
- Role-based access: User & Admin
- Browse, search, and view concert details
- Purchase tickets with real-time seat availability
- Order management & payment status tracking
- Download e-tickets in PDF format
- Admin dashboard: manage concerts, users, verify payments, view sales reports
- Responsive, mobile-friendly UI
- Secure API endpoints with token validation

---

## 📁 Project Structure

```
concert-ticketing-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models/         # SQLAlchemy models (User, Concert, Order, Ticket, etc)
│   │   ├── routes/         # REST API endpoints (auth, concerts, orders, admin, tickets)
│   │   └── utils/          # Helpers, PDF generator, database, auth
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Flask entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Modal, Pagination, etc)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Main pages (Home, Login, Register, Concerts, Orders, Admin, etc)
│   │   ├── services/       # API services (auth, concerts, orders, admin, tickets)
│   │   └── utils/          # JS helpers
│   ├── public/
│   ├── package.json        # Frontend dependencies
│   └── ...
├── database_setup.sql      # Initial SQL schema
└── README.md
```

---

## ⚙️ Getting Started

### 1. Backend (Flask)
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env  # Edit DB & JWT_SECRET_KEY as needed
python run.py
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Configuration
- **Backend `.env`:**
  - `DATABASE_URL` (e.g. `mysql+pymysql://root:@localhost/concert_app2`)
  - `JWT_SECRET_KEY` (use a long, random string; do not change after deploy)
- **Frontend `.env`:**
  - `VITE_API_BASE_URL` (default: `http://localhost:5001/api`)

---

## 🛠️ Development Notes
- Use Python 3.12 (Pillow and some dependencies are not yet compatible with 3.13)
- For local development, use XAMPP/MySQL or compatible MySQL server
- If you change password hashing method, reset all user passwords
- For JWT/token errors, always check JWT_SECRET_KEY consistency and Authorization header format
- All API endpoints are protected and require valid JWT for access
- Codebase follows best practices for modularity, security, and maintainability

---

## 🙏 Credits
- Built with ❤️ using React, Flask, and open-source libraries.
- Special thanks to all contributors and the open-source community.