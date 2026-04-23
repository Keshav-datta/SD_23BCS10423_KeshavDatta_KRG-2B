from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import events, bookings, payments, auth
import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ticket Booking System")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(payments.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Ticket Booking System API"}
