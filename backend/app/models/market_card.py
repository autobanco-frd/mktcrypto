# backend/app/models/market_card.py
from sqlalchemy import Column, String, Integer, Enum, JSON, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum as PyEnum
import uuid
from datetime import datetime

Base = declarative_base()

class CardType(PyEnum):
    PREDICTION = "PREDICTION"
    SERVICE = "SERVICE"
    CONTENT = "CONTENT"
    P2P = "P2P"
    MARKETPLACE = "MARKETPLACE"
    JOB = "JOB"
    FOOD = "FOOD"
    TRADES = "TRADES"
    BEAUTY = "BEAUTY"

class CardStatus(PyEnum):
    OPEN = "OPEN"
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    SETTLED = "SETTLED"
    EXPIRED = "EXPIRED"
    DISPUTED = "DISPUTED"

class MarketCard(Base):
    __tablename__ = "market_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(CardType), nullable=False)
    status = Column(Enum(CardStatus), default=CardStatus.OPEN, nullable=False)
    price_sats = Column(Integer, nullable=False)
    creator_pubkey = Column(String(255), nullable=False)
    metadata = Column(JSON, nullable=False)  # Campo crítico para lógica específica
    payment_hash = Column(String(255), index=True)  # Para Webhooks de Alby
    bolt11_invoice = Column(Text)  # Invoice completa
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime)
    
    # Métodos universales
    def to_dict(self):
        return {
            "id": str(self.id),
            "type": self.type.value,
            "status": self.status.value,
            "price_sats": self.price_sats,
            "creator_pubkey": self.creator_pubkey,
            "metadata": self.metadata,
            "payment_hash": self.payment_hash,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }
    
    def update_status(self, new_status: CardStatus):
        self.status = new_status
        self.updated_at = datetime.utcnow()
