from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from services.search_index import search_events_in_es

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/search", response_model=List[schemas.EventBase])
def search_events(query: str = "", location: str = "", db: Session = Depends(get_db)):
    """
    Search events by title, location.
    HA Design: In production this hits Elasticsearch for fast, fuzzy full-text search.
    Falls back to DB for local dev.
    """
    es_hit_ids = search_events_in_es(query, location)
    
    q = db.query(models.Event)
    
    if es_hit_ids is not None:
        # ES responded, filter by those IDs
        if not es_hit_ids:
            return [] # No hits in ES
        q = q.filter(models.Event.id.in_(es_hit_ids))
    else:
        # Fallback to DB
        if query:
            q = q.filter(models.Event.title.ilike(f"%{query}%"))
        if location:
            q = q.filter(models.Event.location.ilike(f"%{location}%"))
            
    return q.all()

@router.get("/{event_id}", response_model=schemas.EventBase)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/{event_id}/seats", response_model=List[schemas.SeatBase])
def get_event_seats(event_id: int, db: Session = Depends(get_db)):
    seats = db.query(models.Seat).filter(models.Seat.event_id == event_id).all()
    return seats
