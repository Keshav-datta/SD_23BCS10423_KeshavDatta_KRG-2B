from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# For a simple local setup, we use SQLite by default to avoid MySQL setup overhead for the user.
# If MySQL is strictly required, the URL would look like: "mysql+pymysql://user:password@localhost/dbname"
# We will use SQLite here to ensure it runs out of the box, but structure it identically to a MySQL setup.
# MySQL Connection String
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:Namaste$QL@localhost:3306/ticketbook"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
