from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import uuid
from services.redis_lock import acquire_seat_locks, release_seat_locks

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.post("/")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    """
    Create a booking for one or more seats.
    STRONG CONSISTENCY: Uses SELECT FOR UPDATE to lock rows.
    Seats are sorted before locking to prevent deadlocks.
    """
    if not booking.seat_ids:
        raise HTTPException(status_code=400, detail="Please select at least one seat.")
    
    order_id = str(uuid.uuid4())
    sorted_seat_ids = sorted(booking.seat_ids)

    # 1. Acquire Redis distributed lock for all seats to prevent thundering herd
    if not acquire_seat_locks(sorted_seat_ids, booking.user_id):
        raise HTTPException(status_code=409, detail="Seats are currently locked by another user. Please try again.")

    try:
        # 2. Lock all rows atomically in DB (ACID fallback)
        seats = (
            db.query(models.Seat)
            .filter(models.Seat.id.in_(sorted_seat_ids))
            .filter(models.Seat.event_id == booking.event_id)
            .with_for_update()
            .all()
        )

        if len(seats) != len(sorted_seat_ids):
            raise HTTPException(status_code=404, detail="One or more seats not found.")

        # Check all seats are still available
        already_booked = [s.seat_number for s in seats if s.is_booked]
        if already_booked:
            raise HTTPException(
                status_code=409,
                detail=f"Seats already taken: {', '.join(already_booked)}. Please select different seats."
            )

        # Atomically create booking records and mark seats
        for seat in seats:
            db.add(models.Booking(
                order_id=order_id,
                user_id=booking.user_id,
                event_id=booking.event_id,
                seat_id=seat.id,
                status="PENDING"
            ))
            seat.is_booked = True

        db.commit()
        return {"message": "Booking created successfully", "order_id": order_id}

    except HTTPException:
        db.rollback()
        release_seat_locks(sorted_seat_ids)
        raise
    except Exception as e:
        db.rollback()
        release_seat_locks(sorted_seat_ids)
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@router.get("/order/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get all bookings under an order_id."""
    bookings = db.query(models.Booking).filter(models.Booking.order_id == order_id).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="Order not found")
    return bookings

@router.get("/user/{user_id}", response_model=list[schemas.BookingUserResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    """Get all bookings for a specific user, including event and seat details."""
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.user_id == user_id)
        .order_by(models.Booking.created_at.desc())
        .all()
    )
    return bookings
