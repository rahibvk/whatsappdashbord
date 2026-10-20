"""
Pydantic schemas for request / response validation.
"""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# ──────────────────────────────────────────────
#  Auth / Registration
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    company_name: str = Field(..., min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: UUID
    company_name: str
    email: str


# ──────────────────────────────────────────────
#  Tenant / Dashboard
# ──────────────────────────────────────────────

class TenantInfo(BaseModel):
    id: UUID
    company_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    tenant: TenantInfo
    email: str
    twilio_configured: bool
    webhook_url: Optional[str] = None


# ──────────────────────────────────────────────
#  Twilio Configuration
# ──────────────────────────────────────────────

class TwilioConfigRequest(BaseModel):
    account_sid: str = Field(..., min_length=30, max_length=64)
    auth_token: str = Field(..., min_length=30, max_length=64)
    whatsapp_number: str = Field(..., min_length=10, max_length=20)

    @field_validator("account_sid")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        if not v.startswith("AC"):
            raise ValueError("Account SID must start with 'AC'")
        return v

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.startswith("+"):
            raise ValueError("WhatsApp number must be in E.164 format (start with '+')")
        return v


class TwilioConfigResponse(BaseModel):
    account_sid_last4: str
    whatsapp_number: str
    is_configured: bool
    webhook_url: str
    updated_at: datetime
