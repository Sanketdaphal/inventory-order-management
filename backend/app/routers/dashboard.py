import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = int(os.getenv("LOW_STOCK_THRESHOLD", "10"))


@router.get("/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    low_stock = [p for p in products if p.quantity_in_stock <= LOW_STOCK_THRESHOLD]

    return schemas.DashboardStats(
        total_products=db.query(models.Product).count(),
        total_customers=db.query(models.Customer).count(),
        total_orders=db.query(models.Order).count(),
        low_stock_products=low_stock[:10],
    )
