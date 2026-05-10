# backend/services/ollama_client.py
import httpx
from typing import Optional

OLLAMA_URL = "http://localhost:11434"

async def ollama_get_models():
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(f"{OLLAMA_URL}/api/tags")
        r.raise_for_status()
        return r.json()

async def ollama_generate(
    model: str,
    prompt: str,
    stream: bool = False,
    format: Optional[str] = None,
    temperature: float = 0.2,
):
    """
    Wrapper for Ollama /api/generate

    Args:
        model: Ollama model name
        prompt: Prompt text
        stream: Enable streaming response
        format: Optional structured output format ("json")
        temperature: Sampling temperature

    Returns:
        If stream=False:
            httpx.Response object

        If stream=True:
            httpx.Response streaming object
    """

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": stream,
        "options": {
            "temperature": temperature
        }
    }

    # Enable Ollama JSON mode
    if format:
        payload["format"] = format

    client = httpx.AsyncClient(timeout=120.0)

    try:
        if stream:
            # Streaming response
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
            )
            response.raise_for_status()
            return response
        else:
            # Normal response
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
            )
            response.raise_for_status()
            return response
    except Exception:
        await client.aclose()
        raise