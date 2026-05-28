# Inventory & Order Management System

Full-stack application for managing products, customers, orders, and inventory tracking.

## Submission Links

| Deliverable | Link |
|-------------|------|
| GitHub Repository | https://github.com/sanketdaphal07/inventory-order-management |
| Backend Docker Hub Image | `docker pull sanketdaphal07/inventory-backend:latest` (push after `docker login`) |
| Frontend (Vercel) | _Set after deploy — see [DEPLOYMENT.md](./DEPLOYMENT.md)_ |
| Backend API (Render) | _Set after deploy — see [DEPLOYMENT.md](./DEPLOYMENT.md)_ |

> **GitHub account note:** The repo is pushed to `sanketdaphal07` because that account is logged into `gh` on this machine. To host it under [Sanketdaphal](https://github.com/Sanketdaphal), run `gh auth login` as that user, create `inventory-order-management`, then `git remote set-url origin https://github.com/Sanketdaphal/inventory-order-management.git` and `git push -u origin master`.

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React 18, React Router, Axios
- **Infrastructure:** Docker, Docker Compose

## Business Rules

- Unique product SKU (HTTP 400 on duplicate)
- Unique customer email (HTTP 400 on duplicate)
- Product stock cannot be negative
- Orders rejected when stock is insufficient (HTTP 400)
- Stock reduced automatically when orders are created
- Order total calculated by the backend
- Stock restored when orders are deleted

## API Endpoints

| Resource | Methods |
|----------|---------|
| `/products` | GET, POST |
| `/products/{id}` | GET, PUT, DELETE |
| `/customers` | GET, POST |
| `/customers/{id}` | GET, DELETE |
| `/orders` | GET, POST |
| `/orders/{id}` | GET, DELETE |
| `/dashboard/stats` | GET |
| `/health` | GET |

Interactive docs: `http://localhost:8000/docs`

## Quick Start (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

```bash
docker compose down      # stop
docker compose down -v   # stop and remove DB volume
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Full PostgreSQL URL (backend) |
| `REACT_APP_API_URL` | Backend URL for React build |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Project Structure

```
├── backend/          # FastAPI application
├── frontend/         # React application
├── docker-compose.yml
├── render.yaml       # Render deployment blueprint
└── DEPLOYMENT.md     # Hosting instructions
```

## Local Development

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in .env
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
# Set REACT_APP_API_URL=http://localhost:8000 in .env
npm start
```

## Docker Hub (Backend)

```bash
docker build -t sanketdaphal07/inventory-backend:latest ./backend
docker push sanketdaphal07/inventory-backend:latest
```
