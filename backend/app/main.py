"""
IndaureX SaaS Platform — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, dashboard, twilio, webhook
from app.core.config import settings
from app.db.session import Base, engine

# ── Create all tables on startup (dev convenience) ──
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow the Next.js frontend ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers under /v1 prefix ──
app.include_router(auth.router, prefix="/v1")
app.include_router(dashboard.router, prefix="/v1")
app.include_router(twilio.router, prefix="/v1")
app.include_router(webhook.router, prefix="/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
