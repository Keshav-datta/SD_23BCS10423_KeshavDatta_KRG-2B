from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from services.kafka_events import publish_booking_event

router = APIRouter(prefix="/payment", tags=["Payment"])

@router.post("/")
def process_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    """
    Mock payment processor.
    In production: integrates with Stripe/Razorpay.
    After success, publishes a Kafka event for async email/notification processing.
    """
    bookings = db.query(models.Booking).filter(models.Booking.order_id == payment.order_id).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="Order not found. Cannot process payment.")

    if all(b.status == "CONFIRMED" for b in bookings):
        raise HTTPException(status_code=400, detail="This order has already been paid.")

    # Record payment
    db.add(models.Payment(order_id=payment.order_id, amount=payment.amount, status="SUCCESS"))

    # Confirm all bookings in the order
    for b in bookings:
        b.status = "CONFIRMED"
    db.commit()

    # Publish async event (Kafka placeholder)
    publish_booking_event("booking.confirmed", {"order_id": payment.order_id, "amount": payment.amount})

    return {"message": "Payment successful! Your tickets are confirmed.", "order_id": payment.order_id}
