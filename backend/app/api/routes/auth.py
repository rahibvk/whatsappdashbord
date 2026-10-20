"""
Authentication routes — registration & login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import get_db
from app.models.models import Tenant, User
from app.schemas.schemas import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new tenant + owner user and return a JWT."""
    # Check for duplicate email
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # 1. Create tenant
    tenant = Tenant(company_name=payload.company_name)
    db.add(tenant)
    db.flush()  # generate tenant.id

    # 2. Create user linked to tenant
    user = User(
        tenant_id=tenant.id,
        email=payload.email,
        hashed_password=_pwd_ctx.hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(tenant)

    # 3. Issue JWT
    token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(tenant.id)}
    )

    return AuthResponse(
        access_token=token,
        tenant_id=tenant.id,
        company_name=tenant.company_name,
        email=user.email,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate an existing user and return a JWT."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not _pwd_ctx.verify(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    tenant = user.tenant
    token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(tenant.id)}
    )

    return AuthResponse(
        access_token=token,
        tenant_id=tenant.id,
        company_name=tenant.company_name,
        email=user.email,
    )
