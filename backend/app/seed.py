"""Populate demo data when the database is empty."""

from sqlalchemy.orm import Session

from . import models
from .database import SessionLocal


def seed_database() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(models.Product).count() > 0:
            return

        products = [
            models.Product(
                name="Wireless Mouse",
                sku="WM-001",
                price=29.99,
                quantity_in_stock=45,
            ),
            models.Product(
                name="Mechanical Keyboard",
                sku="KB-002",
                price=89.99,
                quantity_in_stock=8,
            ),
            models.Product(
                name="USB-C Hub",
                sku="HUB-003",
                price=49.99,
                quantity_in_stock=3,
            ),
            models.Product(
                name="27-inch Monitor",
                sku="MON-004",
                price=299.99,
                quantity_in_stock=12,
            ),
            models.Product(
                name="Laptop Stand",
                sku="LS-005",
                price=39.99,
                quantity_in_stock=0,
            ),
        ]
        db.add_all(products)

        customers = [
            models.Customer(
                full_name="Alice Johnson",
                email="alice@example.com",
                phone="+1-555-0101",
            ),
            models.Customer(
                full_name="Bob Smith",
                email="bob@example.com",
                phone="+1-555-0102",
            ),
            models.Customer(
                full_name="Carol Williams",
                email="carol@example.com",
                phone="+1-555-0103",
            ),
        ]
        db.add_all(customers)
        db.flush()

        mouse = products[0]
        keyboard = products[1]
        order = models.Order(customer_id=customers[0].id, total_amount=119.98)
        db.add(order)
        db.flush()

        db.add_all(
            [
                models.OrderItem(
                    order_id=order.id,
                    product_id=mouse.id,
                    quantity=1,
                    unit_price=mouse.price,
                ),
                models.OrderItem(
                    order_id=order.id,
                    product_id=keyboard.id,
                    quantity=1,
                    unit_price=keyboard.price,
                ),
            ]
        )
        mouse.quantity_in_stock -= 1
        keyboard.quantity_in_stock -= 1

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
