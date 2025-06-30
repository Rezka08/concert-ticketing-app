# Concert Ticketing App

A modern, fullstack web application for online concert ticketing, built with the latest technologies for a seamless user and admin experience.

---

## 🚀 Tech Stack

<p align="center">
  <!-- Frontend -->
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React.js" height="30" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=FFD62E" alt="Vite" height="30" />
  <img src="https://img.shields.io/badge/Context%20API-509CEE?logo=redux&logoColor=white" alt="Context API" height="30" />
  <img src="https://img.shields.io/badge/React%20Router-CA4245?logo=reactrouter&logoColor=white" alt="React Router" height="30" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" height="30" />
  <img src="https://img.shields.io/badge/DaisyUI-FFFFFF?logo=daisyui&logoColor=F472B6" alt="DaisyUI" height="30" />

  <!-- Backend -->
  <img src="https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white" alt="Flask" height="30" />
  <img src="https://img.shields.io/badge/SQLAlchemy-000000?logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" height="30" />
  <img src="https://img.shields.io/badge/Flask––JWT–Extended-000000?logo=jsonwebtokens&logoColor=white" alt="Flask‑JWT‑Extended" height="30" />
  <img src="https://img.shields.io/badge/Flask–CORS-000000?logo=cors&logoColor=white" alt="Flask‑CORS" height="30" />

  <!-- Database -->
  <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL" height="30" />

  <!-- Utilities -->
  <img src="https://img.shields.io/badge/Pillow-FFD400?logo=pillow&logoColor=black" alt="Pillow" height="30" />
  <img src="https://img.shields.io/badge/ReportLab-EA1F63?logo=reportlab&logoColor=white" alt="ReportLab" height="30" />
  <img src="https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" height="30" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" alt="Axios" height="30" />

  <!-- Dev Tools -->
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" height="30" />
  <img src="https://img.shields.io/badge/PostCSS-DD3A0A?logo=postcss&logoColor=white" alt="PostCSS" height="30" />
  <img src="https://img.shields.io/badge/Vite—Dev–Tool-646CFF?logo=vite&logoColor=FFD62E" alt="Vite Dev Tools" height="30" />
</p>

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
