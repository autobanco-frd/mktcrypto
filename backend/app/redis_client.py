import redis
import os
import json
from datetime import datetime

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

# Create Redis client
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def publish_payment_confirmation(payment_hash: str, status: str):
    """Publish payment confirmation to Redis for SSE"""
    message = {
        "payment_hash": payment_hash,
        "status": status,
        "timestamp": str(datetime.utcnow())
    }
    await redis_client.publish("payment_events", json.dumps(message))

async def subscribe_to_payment_events():
    """Subscribe to payment events for SSE"""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("payment_events")
    return pubsub
