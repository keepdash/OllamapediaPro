# Pydantic models for Ollamapedia Pro API
from pydantic import BaseModel
from typing import List, Optional

class AskRequest(BaseModel):
    question: str
    model: str

class AskResponse(BaseModel):
    answer: str
    context: List[str]
    sources: List[str]

class HealthResponse(BaseModel):
    ollama: bool
    kiwix: bool
    backend: bool = True
