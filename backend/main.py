# backend/main.py
# Ollamapedia Pro - FastAPI Backend Starter
# Run:
#   pip install fastapi uvicorn httpx pydantic
#   uvicorn main:app --reload --port 8001
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from backend.api.endpoints import router as api_router
from backend.utils.error_handling import http_exception_handler, validation_exception_handler

app = FastAPI(title="Ollamapedia Pro")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router)

# Exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
