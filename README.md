# Post-Disaster Building Assessment System (DisasterVision AI)

AI-powered post-disaster structural integrity and building damage assessment platform using Computer Vision and Deep Learning.

---

## 📁 Repository Structure

```text
post-disaster-building-assessment/
│
├── frontend/                     # React + Vite Modern AI SaaS Frontend
│   ├── src/
│   │   ├── assets/images/        # Authentic disaster imagery presets
│   │   ├── components/           # UI components (DamageMeter, Map, Report, etc.)
│   │   ├── pages/                # Home, Upload & Analyze, Dashboard, Technology, About
│   │   ├── services/             # API service layer with mock fallback
│   │   └── styles/               # Pure modern CSS design system
│   ├── API_CONTRACT.md           # Backend API request & response specification
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python / FastAPI Backend API (In Development)
│
└── ml_models/                    # PyTorch Deep Learning Models & xBD Dataset (In Development)
```

---

## 🚀 Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be live at `http://localhost:5174`.

---

## 🔌 Backend API Integration

See [`frontend/API_CONTRACT.md`](frontend/API_CONTRACT.md) for full REST API specifications for the `POST /api/v1/analyze`, `GET /api/v1/analytics`, and `GET /api/v1/map/zones` endpoints.
