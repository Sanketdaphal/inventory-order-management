# Deployment Guide

## Backend — Render (free)

1. Push this repo to GitHub.
2. On [Render](https://render.com), create a **PostgreSQL** database (free tier).
3. Create a **Web Service** from the repo:
   - **Root Directory:** `backend`
   - **Environment:** Docker (or Python with start command below)
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables:
   - `DATABASE_URL` — Internal Database URL from Render Postgres
   - `CORS_ORIGINS` — Your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
5. Copy the public backend URL (e.g. `https://inventory-api.onrender.com`).

Alternatively use the included `render.yaml` blueprint from the Render dashboard.

## Frontend — Vercel (free)

1. Import the GitHub repo on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL (no trailing slash)
4. Deploy and copy the production URL.

## Docker Hub (backend image)

```bash
docker login
docker build -t sanketdaphal/inventory-backend:latest ./backend
docker push sanketdaphal/inventory-backend:latest
```

Update `README.md` submission table with your live URLs after deployment.
