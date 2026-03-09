from fastapi import FastAPI, HTTPException, Depends, Request

from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from sse_starlette.sse import EventSourceResponse

import os

import hmac

import hashlib

import asyncio

from .database import engine, get_db

from .models import Base, LuminaEvent

@asynccontextmanager

async def lifespan(app: FastAPI):

    async with engine.begin() as conn:

        await conn.run_sync(Base.metadata.create_all)

    yield

app = FastAPI(lifespan=lifespan, title="Market Cards Backend", version="0.1.0")

def verify_signature(request: Request, body: bytes, secret: str) -> bool:

    signature = request.headers.get("X-Alby-Signature")

    if not signature:

        return False

    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    return hmac.compare_digest(signature, expected)

async def event_generator():

    # Placeholder for SSE: yields updates every 10 seconds

    while True:

        yield {"event": "update", "data": "Event status changed"}

        await asyncio.sleep(10)

@app.get("/api/v1/events")

async def events():

    return EventSourceResponse(event_generator())

@app.get("/")

async def root():

    return {"message": "Welcome to Market Cards"}

@app.post("/api/v1/webhooks/alby")

async def alby_webhook(request: Request, db: AsyncSession = Depends(get_db)):

    body = await request.body()

    secret = os.getenv("ALBY_WEBHOOK_SECRET")

    if secret and not verify_signature(request, body, secret):

        raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()

    payment_hash = data.get("payment_hash")

    if payment_hash:

        result = await db.execute(select(LuminaEvent).where(LuminaEvent.payment_hash == payment_hash))

        event = result.scalars().first()

        if event:

            event.status = "SETTLED"

            await db.commit()

    return {"status": "ok"}
