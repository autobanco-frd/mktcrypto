from fastapi import FastAPI, HTTPException, Depends, Request
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette.sse import EventSourceResponse
import os
import hmac
import hashlib
import asyncio
import json
from datetime import datetime

from .database import engine, get_db
from .models import Base, MKTEvent, EventStatus
from .redis_client import publish_payment_confirmation

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan, title="MKTcrypto.store Backend", version="0.1.0")

def verify_alby_signature(request: Request, body: bytes, secret: str) -> bool:
    """
    Valida que el aviso de pago realmente venga de Alby y no de un impostor.
    """
    signature = request.headers.get("X-Alby-Signature")
    if not signature:
        return False
    
    expected_sig = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

async def event_generator():
    """SSE event generator for payment confirmations"""
    # Placeholder for SSE: yields updates every 10 seconds
    while True:
        yield {"event": "heartbeat", "data": json.dumps({"timestamp": datetime.utcnow().isoformat()})}
        await asyncio.sleep(10)

@app.get("/api/v1/events")
async def events():
    return EventSourceResponse(event_generator())

@app.get("/")
async def root():
    return {"message": "MKTcrypto.store API", "version": "0.1.0"}

@app.post("/api/v1/webhooks/alby")
async def alby_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Webhook endpoint for Alby payment confirmations"""
    body = await request.body()
    secret = os.getenv("ALBY_WEBHOOK_SECRET")
    
    if secret and not verify_alby_signature(request, body, secret):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    payment_hash = data.get("payment_hash")
    status = data.get("status")  # Expected: "settled" or similar
    
    if not payment_hash or not status:
        raise HTTPException(status_code=400, detail="Missing payment_hash or status")
    
    # Find the event by payment_hash
    result = await db.execute(select(MKTEvent).where(MKTEvent.payment_hash == payment_hash))
    event = result.scalars().first()
    
    if event:
        # Update event status based on webhook
        if status.lower() == "settled":
            event.status = EventStatus.SETTLED
        elif status.lower() == "expired":
            event.status = EventStatus.EXPIRED
        
        await db.commit()
        
        # Publish to Redis for SSE
        await publish_payment_confirmation(payment_hash, status.upper())
        
        return {"status": "ok", "event_id": event.id, "updated_status": event.status.value}
    
    # If event not found, still acknowledge the webhook
    return {"status": "ok", "message": "Event not found for payment_hash"}
