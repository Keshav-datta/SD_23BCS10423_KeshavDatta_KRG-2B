import redis
import logging

logger = logging.getLogger(__name__)

redis_client = None
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_connect_timeout=2)
    redis_client.ping()
    logger.info("Redis connected successfully.")
except Exception as e:
    logger.warning(f"Redis could not connect. Running in mock mode. Error: {e}")
    redis_client = None

def acquire_seat_locks(seat_ids: list, user_id: int) -> bool:
    """
    Acquire distributed locks for multiple seats in Redis.
    Uses SETNX (set if not exists) with a 10-minute expiration.
    This prevents double-booking at the edge before even hitting the DB.
    """
    if not redis_client:
        logger.info("[MOCK REDIS] Acquired locks successfully.")
        return True
    
    locked_keys = []
    try:
        for seat_id in seat_ids:
            key = f"seat_lock:{seat_id}"
            # Lock expires in 600s (10 mins) if user doesn't pay
            acquired = redis_client.set(key, str(user_id), nx=True, ex=600)
            if acquired:
                locked_keys.append(key)
            else:
                # If we fail to acquire any seat, rollback the ones we did get
                for lk in locked_keys:
                    redis_client.delete(lk)
                return False
        return True
    except Exception as e:
        logger.error(f"Redis error during locking: {e}")
        return True # Fail open to let DB SELECT FOR UPDATE handle it

def release_seat_locks(seat_ids: list):
    """
    Release distributed locks for seats in Redis.
    """
    if not redis_client:
        return
    
    try:
        keys = [f"seat_lock:{seat_id}" for seat_id in seat_ids]
        if keys:
            redis_client.delete(*keys)
    except Exception as e:
        logger.error(f"Redis error during unlocking: {e}")
