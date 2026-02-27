from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
try:
    from database import Base
except ImportError:
    from .database import Base

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    name = Column(String, index=True)
    hunger = Column(Float, default=100.0)
    mood = Column(Float, default=100.0)
    energy = Column(Float, default=100.0)
    last_update = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
