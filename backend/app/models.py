from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum

from sqlalchemy.ext.declarative import declarative_base

import uuid

from datetime import datetime

Base = declarative_base()

class User(Base):

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    pubkey = Column(String, nullable=True)

    display_name = Column(String, nullable=False)

    email = Column(String, nullable=True)

    password_hash = Column(String, nullable=True)

    reputation_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

class LuminaEvent(Base):

    __tablename__ = "lumina_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    type = Column(Enum("CONTENT", "BET", "P2P", "PROXY", name="event_type"), nullable=False)

    creator_id = Column(String, ForeignKey("users.id"), nullable=True)

    payload_preview = Column(String, nullable=False)

    payload_encrypted = Column(String, nullable=False)

    amount_sats = Column(Integer, nullable=False)

    payment_hash = Column(String, nullable=False)

    status = Column(Enum("OPEN", "SETTLED", "EXPIRED", name="event_status"), nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)
