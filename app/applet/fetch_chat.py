import urllib.request
import re
import json

url = "https://chatgpt.com/share/6ad9b41c-62fc-83ea-b269-00fd73a895ca"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    with open("chat_dump.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Downloaded HTML, length:", len(html))

    # Search for title and meta description
    title = re.search(r'<title>(.*?)</title>', html)
    print("Title:", title.group(1) if title else "No title")

    # Look for script tags with JSON
    matches = re.findall(r'window\.__reactRouterContext\.streamController\.enqueue\("(.*?)"\);', html)
    print("Found streamController chunks:", len(matches))

    # Also search for words / arabic text
    arabic_matches = re.findall(r'[\u0600-\u06FF\s0-9a-zA-Z\-_:.,()]{15,}', html)
    print("Arabic matches sample:", arabic_matches[:10])

except Exception as e:
    print("Error:", e)
