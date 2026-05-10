# API route definitions for Ollamapedia Pro
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from ..services.ollama_client import ollama_generate, ollama_get_models
from ..services.kiwix_client import kiwix_search, kiwix_fetch_article
from ..services.query_processing import process_query
from ..services.retrieval import rank_articles, build_context, extract_keywords, stream_final_answer
from ..api.models import AskRequest, AskResponse, HealthResponse
from ..utils.health import get_health_status

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
async def ask_endpoint(request: AskRequest):
    try:        
        return StreamingResponse(
            stream_final_answer(request.question, request.model),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

'''
@router.post("/query")
async def query_ollama(request: AskRequest):
    try:
        response = await ollama_generate(request.model, request.question)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/search")
async def search_term_in_kiwix(query: str):
    try:
        results = await kiwix_search(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''

@router.get("/models")
async def models():
    try:
        data = await ollama_get_models()
        return data
    except Exception as e:
        raise HTTPException(500, str(e))
    
@router.get("/health", response_model=HealthResponse)
async def health_endpoint():
    return await get_health_status()

@router.get("/root")
def root():
    return {"name": "Ollamapedia Pro Backend"}

@router.get("/status")
async def status_endpoint():
    # ...implementation will be added...
    pass
