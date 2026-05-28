# Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11 + FastAPI + SQLAlchemy  |
| Frontend  | React 18 + React Router + Axios     |
| Database  | PostgreSQL 15                        |
| Container | Docker + Docker Compose             |

---

## Features

- **Product Management** – CRUD with unique SKU enforcement and stock tracking
- **Customer Management** – CRUD with unique email enforcement
- **Order Management** – Create orders with multiple items; automatic inventory deduction
- **Business Rules**:
  - Unique product SKUs (400 error on duplicate)
  - Unique customer emails (400 error on duplicate)
  - Insufficient stock returns a descriptive 400 error
  - Stock is automatically reduced on order placement
  - Stock is restored when an order is cancelled or deleted
- **Dashboard** – Live stats, low-stock alerts, recent orders
- **Responsive UI** – Works on desktop and mobile

---

## Project Structure

```
SPO_Assignment/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS + router registration
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py  # /api/products CRUD
│   │       ├── customers.py # /api/customers CRUD
│   │       └── orders.py    # /api/orders CRUD + inventory logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js           # Router + sidebar layout
│   │   ├── api.js           # Axios API calls
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Customers.js
│   │       └── Orders.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env                     # Local env vars (not committed)
└── .env.example
```

---

## Quick Start (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run

```bash
# Clone the repo
git clone <your-repo-url>
cd SPO_Assignment

# Copy env file
cp .env.example .env  # edit values if needed

# Build and start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs (Swagger): http://localhost:8000/docs
```

### Stop

```bash
docker-compose down          # stop containers
docker-compose down -v       # stop + delete DB volume
```

---

## Environment Variables

| Variable            | Default          | Description                        |
|---------------------|------------------|------------------------------------|
| `POSTGRES_USER`     | `postgres`       | PostgreSQL username                |
| `POSTGRES_PASSWORD` | `password`       | PostgreSQL password                |
| `POSTGRES_DB`       | `inventory_db`   | PostgreSQL database name           |
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend URL used by frontend |

---

## API Endpoints

### Products `/api/products`
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | `/`               | List all products        |
| GET    | `/{id}`           | Get product by ID        |
| POST   | `/`               | Create product           |
| PUT    | `/{id}`           | Update product           |
| DELETE | `/{id}`           | Delete product           |

### Customers `/api/customers`
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | `/`               | List all customers       |
| GET    | `/{id}`           | Get customer by ID       |
| POST   | `/`               | Create customer          |
| PUT    | `/{id}`           | Update customer          |
| DELETE | `/{id}`           | Delete customer          |

### Orders `/api/orders`
| Method | Path              | Description                                    |
|--------|-------------------|------------------------------------------------|
| GET    | `/`               | List all orders                                |
| GET    | `/{id}`           | Get order by ID                                |
| POST   | `/`               | Create order (validates & deducts stock)       |
| PUT    | `/{id}`           | Update order status (restores stock if cancel) |
| DELETE | `/{id}`           | Delete order (restores stock)                  |

Full interactive API documentation is available at **`http://localhost:8000/docs`** (Swagger UI).

---

## Docker Hub

```bash
# Pull images
docker pull <your-dockerhub-username>/inventory-backend:latest
docker pull <your-dockerhub-username>/inventory-frontend:latest

# Push (after building)
docker build -t <your-dockerhub-username>/inventory-backend:latest ./backend
docker push <your-dockerhub-username>/inventory-backend:latest

docker build -t <your-dockerhub-username>/inventory-frontend:latest ./frontend
docker push <your-dockerhub-username>/inventory-frontend:latest
```

---

## Deployment

### Backend – [Render](https://render.com) (Free tier)
1. Create a new **Web Service**, connect your GitHub repo
2. Set **Root Directory** → `backend`
3. Set **Build Command** → `pip install -r requirements.txt`
4. Set **Start Command** → `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable `DATABASE_URL` pointing to your Render PostgreSQL instance

### Frontend – [Vercel](https://vercel.com) (Free tier)
1. Import your GitHub repo
2. Set **Root Directory** → `frontend`
3. Add environment variable `REACT_APP_API_URL` = your Render backend URL
4. Deploy

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
# Create a .env with DATABASE_URL pointing to local Postgres
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
# Create a .env with REACT_APP_API_URL=http://localhost:8000
npm start
```
