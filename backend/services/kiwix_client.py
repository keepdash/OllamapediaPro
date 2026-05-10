# backend/services/kiwix_client.py
import httpx
import re
import urllib.parse

KIWIX_URL = "http://localhost"
KIWIX_LIBRARY_ID = "wikipedia_en_all_maxi_2025-08"

# backend/services/kiwix_client.py

import httpx, urllib.parse, re

async def kiwix_search(query: str):
    safe_query = urllib.parse.quote(query)

    url = f"{KIWIX_URL}/search?books.name={KIWIX_LIBRARY_ID}&pattern={safe_query}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        if r.status_code != 200:
            return []
        html = r.text
        found_links = re.findall(
            r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
            html,
            re.I | re.S
        )
        results = []
        for link, title in found_links:
            if "search?" in link.lower():
                continue
            if link.startswith("http"):
                continue
            title = re.sub("<.*?>", "", title).strip()
            if not title:
                continue
            if not link.startswith("/"):
                link = "/" + link
            results.append({
                "title": title,
                "link": link
            })
        return results[:5]

async def kiwix_fetch_article(path):
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            r = await client.get(KIWIX_URL + path)
            r.raise_for_status()
            
            # Remove scripts, styles, and potentially navigation/tables for cleaner text
            text = re.sub(r'<(script|style|nav|table).*?</\1>', '', r.text, flags=re.S | re.I)
            text = re.sub(r'<.*?>', ' ', text)
            
            # Clean up whitespace
            clean_text = " ".join(text.split())
            
            # Increase limit to 15,000 for better depth
            return clean_text[:15000] 
        except Exception as e:
            print(f"DEBUG: Fetch failed for {path}: {e}")
            return ""