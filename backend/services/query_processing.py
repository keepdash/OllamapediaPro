# Query understanding and context building for Ollamapedia Pro
from typing import Dict
import re

def process_query(question: str) -> Dict:
    # Basic normalization and keyword extraction (placeholder)
    normalized = question.strip().lower()
    keywords = re.findall(r"\w+", normalized)
    return {"normalized": normalized, "keywords": keywords}
