"""
SQLAlchemy ORM models for the multi-tenant SaaS platform.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class Tenant(Base):
    """
    Represents a company / organisation.
    Every row is a unique tenant boundary.
    """

    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    twilio_config = relationship(
        "TwilioConfig", back_populates="tenant", uselist=False, cascade="all, delete-orphan"
    )


class User(Base):
    """
    A user that belongs to exactly one tenant.
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    email = Column(String(320), unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    tenant = relationship("Tenant", back_populates="users")


class TwilioConfig(Base):
    """
    Tenant-scoped Twilio credentials.
    Auth token is stored encrypted at rest via Fernet.
    """

    __tablename__ = "twilio_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(
        UUID(as_uuid=True), ForeignKey("tenants.id"), unique=True, nullable=False
    )
    account_sid = Column(String(64), nullable=False)
    auth_token_encrypted = Column(Text, nullable=False)  # Fernet-encrypted
    whatsapp_number = Column(String(20), nullable=False)
    is_configured = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="twilio_config")
