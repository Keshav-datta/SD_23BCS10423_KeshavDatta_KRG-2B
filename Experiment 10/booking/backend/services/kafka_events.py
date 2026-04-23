import json
import logging
from kafka import KafkaProducer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fallback in case Kafka is not running locally yet
producer = None
try:
    producer = KafkaProducer(
        bootstrap_servers=['localhost:9092'],
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        retries=3
    )
    logger.info("Kafka Producer connected successfully.")
except Exception as e:
    logger.warning(f"Kafka Producer could not connect. Running in mock mode. Error: {e}")

def publish_booking_event(topic: str, payload: dict):
    """
    Publishes an event to Kafka. If Kafka is unavailable, it gracefully degrades
    by just logging the event (helpful for local dev without Docker running).
    """
    if producer:
        try:
            future = producer.send(topic, payload)
            record_metadata = future.get(timeout=2)
            logger.info(f"Published to Kafka topic '{record_metadata.topic}' partition {record_metadata.partition}")
        except Exception as e:
            logger.error(f"Failed to publish to Kafka: {e}")
    else:
        logger.info(f"[MOCK KAFKA] Topic: {topic} | Payload: {payload}")
