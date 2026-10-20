"""
Dashboard route — returns tenant context for the authenticated user.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import DashboardResponse, TenantInfo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_user)):
    """Return the tenant dashboard context for the current user."""
    tenant = current_user.tenant
    twilio_cfg = tenant.twilio_config

    webhook_url = None
    if twilio_cfg and twilio_cfg.is_configured:
        webhook_url = f"{settings.WEBHOOK_BASE_URL}/{tenant.id}"

    return DashboardResponse(
        tenant=TenantInfo.model_validate(tenant),
        email=current_user.email,
        twilio_configured=twilio_cfg is not None and twilio_cfg.is_configured,
        webhook_url=webhook_url,
    )
