"""
Webhook endpoint — Twilio POSTs incoming WhatsApp messages here.
This is the public-facing ingress; no JWT required.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import TwilioConfig

router = APIRouter(prefix="/twilio", tags=["Twilio Webhook"])


@router.post("/webhook/{tenant_id}")
async def twilio_webhook(tenant_id: UUID, request: Request, db: Session = Depends(get_db)):
    """
    Receive incoming WhatsApp messages from Twilio for a specific tenant.
    Phase 1 simply acknowledges; message processing will be added in Phase 2.
    """
    cfg = db.query(TwilioConfig).filter(TwilioConfig.tenant_id == tenant_id).first()
    if not cfg or not cfg.is_configured:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Twilio configuration found for this tenant",
        )

    # Parse the form-encoded body that Twilio sends
    form_data = await request.form()
    incoming_msg = form_data.get("Body", "")
    from_number = form_data.get("From", "")

    # TODO (Phase 2): Route the message to the tenant's processing pipeline.
    print(f"[Webhook] tenant={tenant_id} from={from_number} body={incoming_msg}")

    # Return a minimal TwiML response to acknowledge receipt
    twiml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    return twiml
