# BikeAI – Smart Bike Ecosystem Platform

BikeAI is a production-ready, full-stack monorepo combining a bike listing marketplace with machine learning analytics. Features include fair price predictions, fraud anomaly flagging, nearest-neighbor personalized recommendations, repair interval regression forecasting, and Random Forest classifier riding style reports.

---

## Folder Structure

```text
bikeai/
├── backend/                  # Django REST Framework backend project
│   ├── bikeai_backend/       # Django configuration & routing root
│   ├── apps/                 # Modular Django domain apps (users, listings, etc.)
│   ├── ml/                   # Decoupled machine learning logics and saved models
│   ├── data/                 # Sample synthetic datasets for training
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py             # Entrypoint utility
│   └── .env.example
├── frontend/                 # React (Vite + Tailwind CSS v4) frontend project
│   ├── src/                  # Component logic, Context, and Pages
│   ├── package.json
│   └── .env.example
└── README.md                 # Project guide (this file)
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and configure:
- `SECRET_KEY`: Private Django signing key.
- `DB_NAME`: MySQL database name (default: `bikeai`).
- `DB_USER`: Database username.
- `DB_PASSWORD`: Database password.
- `DB_HOST`: Host address (default: `localhost`).
- `DB_PORT`: Database port (default: `3306`).
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud identifier.
- `CLOUDINARY_API_KEY`: Cloudinary API credential key.
- `CLOUDINARY_API_SECRET`: Cloudinary signing key.

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
- `VITE_API_URL`: Point to the Django server endpoint (default: `http://127.0.0.1:8000/api`).

---

## Setup Instructions

### 1. Database Setup
Log into your local MySQL server and create the database:
```sql
CREATE DATABASE IF NOT EXISTS bikeai;
```

### 2. Backend Setup
1. Open a terminal in `/backend` and create a virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   - **Windows PowerShell:** `.venv\Scripts\Activate.ps1`
   - **Unix/macOS:** `source .venv/bin/activate`
3. Upgrade pip and install dependencies:
   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Build the model binaries (pre-trains and serializes sklearn files):
   ```bash
   python ml/train_models.py
   ```
5. Apply database schema migrations:
   ```bash
   python manage.py makemigrations users listings fraud maintenance riding_style
   python manage.py migrate
   ```

### 3. Frontend Setup
1. Open a terminal in `/frontend` and install packages:
   ```bash
   npm install
   ```

---

## Running Locally

To run both servers concurrently:

### Run Backend
In the `/backend` directory (with virtual environment active):
```bash
python manage.py runserver
```
*API documentation (Swagger UI) is available at:* `http://127.0.0.1:8000/api/docs/`

### Run Frontend
In the `/frontend` directory:
```bash
npm run dev
```
*Frontend client application runs at:* `http://localhost:5173/`

---

## Next Steps for Deployment

1. **Backend & DB Deployment:**
   - Deploy Django to platforms like Render or Railway. Set production WSGI/ASGI configurations, configure ALLOWED_HOSTS, and toggle `DEBUG = False`.
   - Host the MySQL database on a managed DB service (e.g. AWS RDS, Railway MySQL add-on).
2. **Frontend Deployment:**
   - Deploy the compiled build bundle (`dist/` folder after running `npm run build`) to Vercel, Netlify, or AWS S3 + CloudFront.
3. **Cloudinary Setup:**
   - Create a free Cloudinary account and insert valid production credentials to support real user image uploads.
