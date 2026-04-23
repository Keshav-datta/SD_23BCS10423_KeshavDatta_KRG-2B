import logging
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError

logger = logging.getLogger(__name__)

es = None
try:
    es = Elasticsearch("http://localhost:9200", request_timeout=2)
    if es.ping():
        logger.info("Elasticsearch connected successfully.")
    else:
        es = None
except Exception as e:
    logger.warning(f"Elasticsearch could not connect. Running in mock mode. Error: {e}")
    es = None

def index_events_in_es(events: list):
    """
    Indexes a list of events into Elasticsearch.
    Called during DB seeding.
    """
    if not es:
        return

    try:
        for event in events:
            doc = {
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "location": event.location,
                "genre": event.genre,
                "language": event.language,
                "cast_info": event.cast_info
            }
            es.index(index="events", id=event.id, document=doc)
        logger.info(f"Indexed {len(events)} events into Elasticsearch.")
    except Exception as e:
        logger.error(f"Failed to index in ES: {e}")

def search_events_in_es(query: str, location: str = ""):
    """
    Searches events in Elasticsearch using multi_match for fuzzy matching.
    Returns a list of matching event IDs. If ES fails, returns None to fallback to DB.
    """
    if not es:
        return None
    
    try:
        must_clauses = []
        if query:
            must_clauses.append({
                "multi_match": {
                    "query": query,
                    "fields": ["title^3", "description", "genre", "cast_info"],
                    "fuzziness": "AUTO"
                }
            })
        if location:
            must_clauses.append({
                "match": {
                    "location": {
                        "query": location,
                        "fuzziness": "AUTO"
                    }
                }
            })

        if not must_clauses:
            return None # Fallback to DB to return all

        body = {
            "query": {
                "bool": {
                    "must": must_clauses
                }
            }
        }
        res = es.search(index="events", body=body)
        hits = res.get("hits", {}).get("hits", [])
        return [int(hit["_id"]) for hit in hits]
    except Exception as e:
        logger.error(f"ES Search failed: {e}")
        return None # Fallback to DB
