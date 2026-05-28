"""Run manually: python -m scripts.seed_db (from backend folder)."""

from app.database import Base, engine
from app.seed import seed_database

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()
    print("Database seeded successfully.")
