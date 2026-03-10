from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

Base = declarative_base()

class EventType(enum.Enum):
    CONTENT = "CONTENT"
    BET = "BET"
    P2P = "P2P"
    PROXY = "PROXY"

class EventStatus(enum.Enum):
    OPEN = "OPEN"
    SETTLED = "SETTLED"
    EXPIRED = "EXPIRED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pubkey = Column(String, nullable=True, unique=True)  # Alby pubkey
    display_name = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
    password_hash = Column(String, nullable=True)
    reputation_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_events = relationship("MKTEvent", back_populates="creator")

class MKTEvent(Base):
    __tablename__ = "mkt_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(Enum(EventType), nullable=False)
    creator_id = Column(String, ForeignKey("users.id"), nullable=True)  # Null for guest
    
    # Payload
    preview = Column(String, nullable=False)  # Public preview
    encrypted_secret = Column(String, nullable=False)  # AES-256 encrypted
    
    # Economics
    amount_sats = Column(Integer, nullable=False)
    payment_hash = Column(String, nullable=False, unique=True, index=True)
    status = Column(Enum(EventStatus), nullable=False, default=EventStatus.OPEN)
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    creator = relationship("User", back_populates="created_events")
