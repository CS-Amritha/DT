from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .endpoints import explain, dashboard

app = FastAPI(title="K8s Monitoring API")

# Allow frontend access (adjust origins in production!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(explain.router, prefix="/explain", tags=["LLM Remediation"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Data"])
