from pydantic import BaseModel
from typing import List, Optional
import datetime

class SeatBase(BaseModel):
    id: int
    seat_number: str
    is_booked: bool
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    id: int
    title: str
    description: str
    location: str
    date: datetime.datetime
    image_url: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    duration_mins: Optional[int] = None
    rating: Optional[float] = None
    cast_info: Optional[str] = None
    ticket_price: float = 15.0
    class Config:
        from_attributes = True

# Auth
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str

# Booking
class BookingCreate(BaseModel):
    user_id: int
    event_id: int
    seat_ids: List[int]

class BookingUserResponse(BaseModel):
    id: int
    order_id: str
    status: str
    event: EventBase
    seat: SeatBase
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# Payment
class PaymentCreate(BaseModel):
    order_id: str
    amount: float
