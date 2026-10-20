"""
Twilio configuration routes — save / retrieve credentials per tenant.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.encryption import encrypt_value
from app.db.session import get_db
from app.models.models import TwilioConfig, User
from app.schemas.schemas import TwilioConfigRequest, TwilioConfigResponse

router = APIRouter(prefix="/twilio", tags=["Twilio Integration"])


@router.post("/config", response_model=TwilioConfigResponse, status_code=status.HTTP_201_CREATED)
def save_twilio_config(
    payload: TwilioConfigRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Save (or update) Twilio credentials for the authenticated user's tenant.
    The auth token is encrypted at rest; only the last 4 chars of the SID
    are ever returned to the frontend.
    """
    tenant_id = current_user.tenant_id

    existing = db.query(TwilioConfig).filter(TwilioConfig.tenant_id == tenant_id).first()

    encrypted_token = encrypt_value(payload.auth_token)

    if existing:
        existing.account_sid = payload.account_sid
        existing.auth_token_encrypted = encrypted_token
        existing.whatsapp_number = payload.whatsapp_number
        existing.is_configured = True
    else:
        existing = TwilioConfig(
            tenant_id=tenant_id,
            account_sid=payload.account_sid,
            auth_token_encrypted=encrypted_token,
            whatsapp_number=payload.whatsapp_number,
        )
        db.add(existing)

    db.commit()
    db.refresh(existing)

    webhook_url = f"{settings.WEBHOOK_BASE_URL}/{tenant_id}"

    return TwilioConfigResponse(
        account_sid_last4=payload.account_sid[-4:],
        whatsapp_number=existing.whatsapp_number,
        is_configured=existing.is_configured,
        webhook_url=webhook_url,
        updated_at=existing.updated_at,
    )


@router.get("/config", response_model=TwilioConfigResponse)
def get_twilio_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve the Twilio config status for the current tenant.
    Never returns the raw auth token.
    """
    tenant_id = current_user.tenant_id
    cfg = db.query(TwilioConfig).filter(TwilioConfig.tenant_id == tenant_id).first()

    if not cfg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Twilio configuration not found for this tenant",
        )

    webhook_url = f"{settings.WEBHOOK_BASE_URL}/{tenant_id}"

    return TwilioConfigResponse(
        account_sid_last4=cfg.account_sid[-4:],
        whatsapp_number=cfg.whatsapp_number,
        is_configured=cfg.is_configured,
        webhook_url=webhook_url,
        updated_at=cfg.updated_at,
    )
