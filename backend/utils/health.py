# backend/utils/health.py
import httpx

KIWIX_URL = "http://localhost"
OLLAMA_URL = "http://localhost:11434"

async def get_health_status():
    ollama_ok = False
    kiwix_ok = False

    async with httpx.AsyncClient(follow_redirects=True, timeout=5.0) as client:
        # Check Ollama
        try:
            r_ollama = await client.get(f"{OLLAMA_URL}/api/tags")
            ollama_ok = r_ollama.status_code == 200
        except Exception:
            ollama_ok = False

        # Check Kiwix JS
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                # kiwix-serve root or /catalog is a good check[cite: 3]
                r_kiwix = await client.get(f"{KIWIX_URL}")
                kiwix_ok = r_kiwix.status_code == 200
        except:
            kiwix_ok = False

    return {
        "ollama": ollama_ok,
        "kiwix": kiwix_ok,
        "backend": True
    }