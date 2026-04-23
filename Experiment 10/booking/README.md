# Ticket Booking System

A simple, well-structured full-stack application built for demonstration and educational purposes (college submission).

## System Overview

This system allows users to search for events, view event details, select seats from an interactive map, and complete a mock payment to secure their booking. It is built to be simple to run locally while adhering to a clean architecture that can be scaled.

## Functional Requirements
- Search events by title, location, or date.
- View event details and a visual representation of seat availability.
- Select and lock seats for booking.
- Process mock payments to confirm a booking.

## Non-Functional Requirements & Scalability
While this repo is designed as a simple single-node setup, it includes architectural explanations and mock services demonstrating how it would scale in a production environment:

1. **High Availability for Search**:
   - The `/events/search` endpoint includes a placeholder for **Elasticsearch**. Relational databases struggle with heavy text-based search at scale. Elasticsearch uses an inverted index to return results rapidly.
2. **Strong Consistency for Booking**:
   - The booking endpoint uses an ACID-compliant database transaction (`SELECT ... FOR UPDATE`) to lock the specific row (seat) during the booking process. This guarantees that two concurrent users cannot book the same seat.
   - For a highly concurrent distributed system, a **Redis distributed lock** is recommended and stubbed out in `backend/services/redis_lock.py` to prevent database "thundering herd" issues.
3. **Asynchronous Processing**:
   - Once a payment succeeds, the system should not wait to send an email or update analytics synchronously. A **Kafka** producer is stubbed out in `backend/services/kafka_events.py` to show how events can be published to a message broker.

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite (default for easy setup, maps exactly to MySQL).
- **Frontend**: React.js, Tailwind CSS, Vite.
- **Tools**: Lucide React for icons.

## Project Structure
```
booking/
├── backend/                  # FastAPI Application
│   ├── main.py               # Entry point
│   ├── database.py           # DB connection
│   ├── models.py             # ORM models
│   ├── schemas.py            # Pydantic validation
│   ├── routers/              # API Endpoints
│   ├── services/             # Mock implementations for Redis, Kafka, ES
│   └── seed.py               # Script to generate sample data
└── frontend/                 # React Application
    ├── src/
    │   ├── components/       # Reusable UI
    │   ├── pages/            # Main views
    │   └── App.jsx           # Routing
    └── package.json
```

## How to Run Locally

### 1. Start the Backend
Open a terminal in the `backend` directory:
```bash
cd backend
pip install -r requirements.txt
python seed.py          # Creates the DB and populates sample events/seats
uvicorn main:app --reload
```
The API will be running at `http://localhost:8000`. You can view the interactive Swagger docs at `http://localhost:8000/docs`.

### 2. Start the Frontend
Open another terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React app will be running at `http://localhost:5173` (or the port Vite specifies in the terminal). Open it in your browser.
