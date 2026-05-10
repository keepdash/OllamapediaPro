# Retrieval, ranking, and context assembly for Ollamapedia Pro
import httpx
import json
import re
from typing import List, Dict
from backend.services.kiwix_client import kiwix_search, kiwix_fetch_article
from backend.services.ollama_client import ollama_generate

OLLAMA_URL = "http://localhost:11434"

def rank_articles(articles: List[Dict], keywords: List[str], top_n: int = 3) -> List[Dict]:
    # Simple keyword overlap ranking (placeholder)
    def score(article):
        text = article.get("text", "").lower()
        return sum(1 for kw in keywords if kw in text)
    ranked = sorted(articles, key=score, reverse=True)
    return ranked[:top_n]

async def extract_keywords(question: str, model: str) -> List[str]:
    prompt = f"""
    You are a cross-lingual Wikipedia entity extractor. 
    Convert the question into 3-5 Wikipedia search keywords in English.
    STRICT RULES:
    1. Output English only
    2. Prefer canonical Wikipedia concepts
    3. Return ONLY JSON

    Examples:
    Q: What is light refraction?
    A: ["Refraction", "Snell's law", "Refractive index", "Optics"]

    Q: 黑洞是如何形成的？
    A: ["Black hole", "Stellar evolution", "Gravitational collapse", "Supernova"]
    
    Format:
    {{"keywords":["A","B","C"]}}

    Question: {question}
    """
    try:
        r = await ollama_generate(
            model,
            prompt,
            stream=False,
            format="json"
        )
        data = r.json()
        txt = data.get("response", "").strip()
        # Qwen reasoning models may place output in "thinking"
        if not txt:
            txt = data.get("thinking", "").strip()
        match = re.search(r'\{.*\}', txt, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found")
        parsed = json.loads(match.group(0))
        keywords = parsed.get("keywords", [])
        if not keywords:
            return [question[:30]]
        return keywords[:5]
    except Exception as e:
        print(f"Keyword error: {e}")
        return [question[:30]]

async def build_context(question: str, model: str):
    keywords = await extract_keywords(question, model)
    print(f"DEBUG: Keywords extracted: {keywords}") # Check if keywords make sense

    # 1. Gather a larger pool of candidates
    candidates = []
    for kw in keywords:
        res = await kiwix_search(kw)
        print(f"DEBUG: Search results for '{kw}': {len(res)} items found")
        candidates.extend(res)
    
    # Deduplicate
    unique_candidates = list(
        {c["title"]: c for c in candidates}.values()
    )
    print(
        f"DEBUG: Unique articles found: "
        f"{[u['title'] for u in unique_candidates]}"
    )

    # 2. LLM Reranking: Ask the LLM to pick the most relevant titles
    titles_list = [c["title"] for c in unique_candidates]
    
    # 3. Reranking prompt
    ranking_prompt = f"""
    You are a Wikipedia reranking engine.

    Question:
    {question}

    Candidate article titles:
    {titles_list}
    
    STRICT RULES:
    1. Select ONLY from the provided titles.
    2. DO NOT invent titles.
    3. Pick the 3 most relevant articles.
    4. Return ONLY valid JSON.
    
    Format:
    {{"selected":["A", "B", "C"]}}
    """
    
    try:
        r = await ollama_generate(
            model,
            ranking_prompt,
            stream=False,
            format="json"
        )
        data = r.json()
        txt = (
            data.get("response")
            or data.get("thinking")
            or ""
        ).strip()
        print("DEBUG RERANK RAW:", repr(txt))
        # Remove markdown fences
        txt = txt.replace("```json", "").replace("```", "")
        # Extract JSON object safely
        match = re.search(r'\{.*\}', txt, re.DOTALL)
        if not match:
            raise ValueError("No JSON found")
        rank_data = json.loads(match.group(0))
        selected_titles = rank_data.get("selected", [])

        # Filter hallucinated titles
        selected_titles = [
            t for t in selected_titles
            if t in titles_list
        ]
        # Fallback if model selected nothing
        if not selected_titles:
            selected_titles = titles_list[:3]
    except Exception as e:
        print(f"Rerank error: {e}")
        selected_titles = titles_list[:3]

    # 3. Fetch only the chosen articles
    contexts = []
    for title in selected_titles:
        # Find the link for the selected title
        item = next((c for c in unique_candidates if c["title"] == title), None)
        if item:
            text = await kiwix_fetch_article(item["link"])
            if text:
                contexts.append({"title": item["title"], "link": item["link"], "content": text})
                
    return keywords, contexts

async def stream_final_answer(question: str, model: str):

    keywords, contexts = await build_context(question, model)

    context_text = "\n\n".join([
        f"[ARTICLE: {c['title']}]\n{c['content']}"
        for c in contexts
    ])

    # Send debug info first
    import json
    yield f"DEBUG_KEYWORDS: {json.dumps(keywords)}\n"
    yield f"DEBUG_ARTICLES: {json.dumps([c['title'] for c in contexts])}\n"
    yield f"DEBUG_SOURCES: {json.dumps([{'title': c['title'], 'link': c['link']} for c in contexts])}\n"

    prompt = f"""
You are an expert encyclopedia assistant. Your goal is to provide a comprehensive, 
engaging, and detailed biography or explanation based on the provided Wikipedia articles.

Instructions:
1. Synthesis: Combine your internal knowledge with the provided [ARTICLE] text to create 
   a cohesive and educational narrative.
2. Structure: Use clear headings, bold text for key terms, and detailed paragraphs.
3. Citations: Always mention which article a specific fact came from.
4. Depth: Don't just list facts; explain the *significance* of the contributions.
5. ALWAYS answer in the SAME LANGUAGE as the user's question.

Text Generation Rules:
Always use standard Markdown. Every header (e.g., #, ##, ###) MUST start on a new line and MUST have a space after the '#' symbols. Use double newlines between every paragraph to ensure proper spacing.

Question:
{question}

Retrieved Keywords:
{keywords}

Context:
{context_text}

Detailed Answer:
"""

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": True
            }
        ) as r:

            async for line in r.aiter_lines():
                if not line.strip():
                    continue

                try:
                    j = json.loads(line)
                    token = j.get("response", "")
                    yield token
                except:
                    continue