import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .database import Base, engine
from .routers import customers, dashboard, orders, products

app = FastAPI(
    title="Inventory & Order Management API",
    description="Manage products, customers, orders, and inventory tracking.",
    version="1.0.0",
)

cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = (
    [origin.strip() for origin in cors_origins.split(",")]
    if cors_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == 9:
                raise
            time.sleep(2)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
