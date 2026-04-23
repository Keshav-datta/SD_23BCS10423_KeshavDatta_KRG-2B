from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    bookings = relationship("Booking", back_populates="user")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), index=True)
    description = Column(String(1000))
    location = Column(String(150))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    image_url = Column(String(500), nullable=True)
    # Metadata fields
    genre = Column(String(100), nullable=True)
    language = Column(String(50), nullable=True)
    duration_mins = Column(Integer, nullable=True)
    rating = Column(Float, nullable=True)
    cast_info = Column(String(500), nullable=True)
    ticket_price = Column(Float, default=15.0)
    seats = relationship("Seat", back_populates="event")

class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    seat_number = Column(String(10))
    is_booked = Column(Boolean, default=False)
    event = relationship("Event", back_populates="seats")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    seat_id = Column(Integer, ForeignKey("seats.id"))
    status = Column(String(20), default="PENDING")  # PENDING, CONFIRMED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="bookings")
    seat = relationship("Seat")
    event = relationship("Event")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), index=True)
    amount = Column(Float)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
