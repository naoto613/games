#!/usr/bin/env python3
"""Collect a small set of good public sources on three themes -- AI活用, PdM and EM --
into data/items.json without any API key.

Supported fetchMethod values (all keyless):
  rss      : RSS/Atom feed at feedUrl (blog, Speaker Deck .atom, etc.)
  youtube  : YouTube's public channel feed
             https://www.youtube.com/feeds/videos.xml?channel_id=UC...
             channelId is resolved automatically from a known video
             (resolveFromVideo) or channel page (resolveFromUrl) and saved.
  auto     : fetch the page at url and use its <link rel="alternate"> feed.
  zenn     : Zenn's public article API for a topic (topic), with like counts.
  qiita    : Qiita API v2 search for a tag (tag), with like counts (60 requests/hour without a token).
  manual   : not collected.

Optional per-source fields:
  lang         : "ja" / "en" (stored on each item)
  tab          : which tab of the app shows the items (default: lang; "layerx" for the LayerX tab)
  requireTag   : keep only entries that match one of the four themes (default true)
  minBookmarks : keep only Hatena Bookmark entries with at least this many users
  minLikes     : keep only Zenn / Qiita articles with at least this many likes
  minViews     : keep only YouTube videos with at least this many views (from the public feed)
  titleLang    : "en" to skip entries whose title is Japanese (e.g. auto-dubbed copies on English channels)
  baseTags     : themes always given to the source's items (e.g. a Zenn topic "pdm" -> ["PdM"])
  mustContain  : keep only entries whose title/summary contains one of these words
  excludeTitle : skip entries whose title contains one of these words (news roundups etc.)
  maxAgeDays   : skip (and drop stored) entries older than this (default 180)

Tags are estimated by simple keyword rules (no AI / no key) and re-estimated on
every run; items with tagsEstimated: false keep their hand-written tags.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from time import mktime
from urllib.parse import urljoin, urlsplit, urlunsplit

import feedparser
import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCES_FILE = ROOT / "data" / "sources.json"
ITEMS_FILE = ROOT / "data" / "items.json"
META_FILE = ROOT / "data" / "meta.json"
USER_AGENT = "Mozilla/5.0 (compatible; AI-Builders-Radar/1.0; personal public-source aggregator)"
TIMEOUT = 25
MAX_ITEMS = 600
DEFAULT_MAX_AGE_DAYS = 180

# The four themes of the app. Lower-case matching; ASCII words match as whole words.
TAG_RULES = {
    "AI活用": ["ai", "llm", "llms", "生成ai", "agent", "agents", "agentic", "aiエージェント", "エージェント", "chatgpt", "claude", "claude code",
              "gemini", "copilot", "cursor", "rag", "プロンプト", "mcp", "vibe coding", "バイブコーディング", "ai駆動", "ai-native",
              "aiネイティブ", "openai", "anthropic", "evals", "コーディングエージェント", "coding agent", "coding agents"],
    "PdM": ["pdm", "pm", "pms", "product manager", "product managers", "product management", "product leader", "product leaders",
            "プロダクトマネージャー", "プロダクトマネジメント", "プロダクトオーナー", "product owner", "product strategy", "プロダクト戦略",
            "product discovery", "ディスカバリー", "product sense", "pmf", "product-market fit", "ロードマップ", "roadmap", "prd"],
    "EM": ["em", "ems", "エンジニアリングマネージャー", "エンジニアリングマネジメント", "engineering manager", "engineering managers",
           "engineering management", "engineering leader", "engineering leaders", "engineering leadership", "1on1", "1on1s",
           "one-on-one", "one-on-ones", "vpoe", "テックリード", "tech lead", "エンジニア組織", "開発組織", "engineering org",
           "engineering organization", "managing engineers", "manager of managers"],
}
LEARNING_RULES = {
    "実践事例": ["やってみた", "導入", "事例", "実践", "取り組み", "運用", "移行", "改善", "how we", "case study", "lessons", "learned"],
    "考え方・フレームワーク": ["フレームワーク", "framework", "考え方", "原則", "principles", "mental model", "playbook", "how to", "guide", "入門"],
    "インタビュー・対談": ["インタビュー", "interview", "対談", "podcast", "ポッドキャスト", "conversation", "ゲスト", "聞いた"],
    "トレンド・調査": ["トレンド", "trend", "trends", "調査", "survey", "report", "レポート", "state of", "未来", "future", "予測"],
}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def canonical_url(url: str) -> str:
    parts = urlsplit((url or "").strip())
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return (url or "").strip()
    query_parts = []
    for pair in parts.query.split("&"):
        key = pair.split("=", 1)[0].lower()
        if key and not (key.startswith("utm_") or key in {"fbclid", "gclid", "ref", "source", "feature"}):
            query_parts.append(pair)
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip("/") or "/", "&".join(query_parts), ""))


def stable_id(url: str) -> str:
    return hashlib.sha256(canonical_url(url).encode("utf-8")).hexdigest()[:24]


def clean_html(value: str) -> str:
    value = re.sub(r"<script\b[^>]*>.*?</script>", " ", value or "", flags=re.I | re.S)
    value = re.sub(r"<style\b[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", unescape(value)).strip()


def entry_date(entry) -> str | None:
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if parsed:
        return datetime.fromtimestamp(mktime(parsed), timezone.utc).isoformat(timespec="seconds")
    raw = entry.get("published") or entry.get("updated")
    if raw:
        try:
            return parsedate_to_datetime(raw).astimezone(timezone.utc).isoformat(timespec="seconds")
        except Exception:
            pass
    return None


def entry_thumbnail(entry) -> str | None:
    for key in ("media_thumbnail", "media_content"):
        for media in entry.get(key) or []:
            if media.get("url"):
                return media["url"]
    for link in entry.get("links") or []:
        if link.get("rel") == "enclosure" and str(link.get("type", "")).startswith("image"):
            return link.get("href")
    m = re.search(r'<img[^>]+src="([^"]+)"', entry.get("summary", "") or "")
    return unescape(m.group(1)) if m else None


def keyword_hits(text: str, words: list[str]) -> bool:
    for w in words:
        if re.fullmatch(r"[a-z0-9./+ -]+", w):
            # ASCII keywords must match as whole words ("go" must not hit "google").
            if re.search(r"(?<![a-z0-9])" + re.escape(w) + r"(?![a-z0-9])", text):
                return True
        elif w in text:
            return True
    return False


def estimate(text: str, rules: dict[str, list[str]], limit: int) -> list[str]:
    text = text.lower()
    return [name for name, words in rules.items() if keyword_hits(text, words)][:limit]


# AI is mentioned almost everywhere now, so "AI活用" needs the AI word in the title itself.
TITLE_ONLY_TAGS = {"AI活用"}


def estimate_tags(title: str, body: str) -> list[str]:
    title, text = title.lower(), f"{title} {body}".lower()
    return [name for name, words in TAG_RULES.items()
            if keyword_hits(title if name in TITLE_ONLY_TAGS else text, words)][:4]


JAPANESE = re.compile(r"[\u3040-\u30ff\u4e00-\u9fff]")


def with_base(tags: list[str], base: list[str]) -> list[str]:
    return [t for t in TAG_RULES if t in tags or t in base]


def http_get(url: str) -> requests.Response:
    res = requests.get(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.8"}, timeout=TIMEOUT)
    res.raise_for_status()
    return res


def find_channel_id(html: str) -> str | None:
    for pattern in (r'"channelId":"(UC[0-9A-Za-z_-]{22})"', r'"externalId":"(UC[0-9A-Za-z_-]{22})"',
                    r'itemprop="channelId" content="(UC[0-9A-Za-z_-]{22})"', r'/channel/(UC[0-9A-Za-z_-]{22})'):
        m = re.search(pattern, html)
        if m:
            return m.group(1)
    return None


def resolve_youtube_channel(source: dict) -> str:
    if not source.get("channelId"):
        candidates = []
        if source.get("resolveFromVideo"):
            candidates.append("https://www.youtube.com/watch?v=" + source["resolveFromVideo"])
        if source.get("resolveFromUrl"):
            candidates.append(source["resolveFromUrl"])
        for url in candidates:
            try:
                html = http_get(url).text
                cid = find_channel_id(html)
            except Exception as exc:
                print(f"[WARN] channelId lookup failed at {url}: {exc}", file=sys.stderr)
                continue
            if cid:
                m = re.search(r'"ownerChannelName":"([^"]+)"', html) or re.search(r'"author":"([^"]+)"', html)
                if m:
                    source["channelName"] = json.loads('"' + m.group(1) + '"')
                source["channelId"] = cid
                source["url"] = "https://www.youtube.com/channel/" + cid
                break
        if not source.get("channelId"):
            raise RuntimeError("YouTube channelId could not be resolved (set channelId in sources.json)")
    return source["channelId"]


def youtube_feed_urls(cid: str) -> list[str]:
    base = "https://www.youtube.com/feeds/videos.xml?"
    # The channel feed sometimes returns 404; the uploads playlist (UU...) is the same list.
    return [base + "channel_id=" + cid, base + "playlist_id=UU" + cid[2:]]


def approx_date(text: str, now: datetime) -> str | None:
    """Turn YouTube's relative "3日前" / "2 weeks ago" into an approximate date."""
    m = re.search(r"(\d+)\s*(秒|分|時間|日|週間|か月|ヶ月|年|second|minute|hour|day|week|month|year)", text or "")
    if not m:
        return None
    n, unit = int(m.group(1)), m.group(2)
    days = {"秒": 0, "second": 0, "分": 0, "minute": 0, "時間": n / 24, "hour": n / 24, "日": n, "day": n,
            "週間": 7 * n, "week": 7 * n, "か月": 30 * n, "ヶ月": 30 * n, "month": 30 * n, "年": 365 * n, "year": 365 * n}[unit]
    from datetime import timedelta
    return (now - timedelta(days=days)).isoformat(timespec="seconds")


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def text_of(node) -> str:
    if not isinstance(node, dict):
        return node if isinstance(node, str) else ""
    if "simpleText" in node:
        return node["simpleText"]
    if "content" in node and isinstance(node["content"], str):
        return node["content"]
    return "".join(r.get("text", "") for r in node.get("runs", []))


def parse_views(text: str) -> int | None:
    """'1.2万 回視聴' / '3,456 views' / '1.2K views' -> int."""
    m = re.search(r"([\d.,]+)\s*(万|億|[kKmM])?", text or "")
    if not m:
        return None
    n = float(m.group(1).replace(",", ""))
    return int(n * {"万": 10_000, "億": 100_000_000, "k": 1_000, "K": 1_000, "m": 1_000_000, "M": 1_000_000}.get(m.group(2), 1))


def scrape_youtube_videos(source: dict, cid: str) -> list[dict]:
    """Last resort without a key: read videos from ytInitialData on the channel's videos page."""
    html = http_get(f"https://www.youtube.com/channel/{cid}/videos?hl=ja&gl=JP").text
    m = re.search(r"ytInitialData\s*=\s*(\{.*?\});\s*</script>", html, re.S)
    if not m:
        title = re.search(r"<title>(.*?)</title>", html, re.S)
        raise RuntimeError(f"ytInitialData not found (page {len(html)} bytes, title={title.group(1)[:60] if title else '-'})")
    data = json.loads(m.group(1))
    now = datetime.now(timezone.utc)
    entries, seen = [], set()
    for node in walk(data):
        if "channelMetadataRenderer" in node:
            source["channelName"] = node["channelMetadataRenderer"].get("title")
        vid = title = when = desc = views = None
        if "videoRenderer" in node:
            r = node["videoRenderer"]
            vid, title = r.get("videoId"), text_of(r.get("title"))
            when, desc = text_of(r.get("publishedTimeText")), text_of(r.get("descriptionSnippet"))
            views = parse_views(text_of(r.get("viewCountText")))
        elif "lockupViewModel" in node:
            r = node["lockupViewModel"]
            if "VIDEO" not in str(r.get("contentType", "VIDEO")):
                continue
            vid = r.get("contentId")
            meta = (r.get("metadata") or {}).get("lockupMetadataViewModel") or {}
            title = text_of(meta.get("title"))
            rows = [text_of(p.get("text")) for n in walk(meta.get("metadata")) for p in n.get("metadataParts", [])]
            when = next((t for t in rows if "前" in t or "ago" in t), None)
            views = next((parse_views(t) for t in rows if "視聴" in t or "view" in t), None)
        if not vid or not title or vid in seen or not re.fullmatch(r"[\w-]{11}", vid):
            continue
        seen.add(vid)
        entries.append({
            "link": "https://www.youtube.com/watch?v=" + vid,
            "title": title,
            "summary": desc or "",
            "publishedApprox": approx_date(when, now) if when else None,
            "media_thumbnail": [{"url": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"}],
            "media_statistics": {"views": views} if views is not None else {},
        })
    if not entries:
        raise RuntimeError(f"no videos found on the channel page (channel={source.get('channelName') or '-'})")
    return entries


def feed_url_for(source: dict) -> str:
    method = source.get("fetchMethod")
    if method == "rss":
        if not source.get("feedUrl"):
            raise RuntimeError("feedUrl is not configured")
        return source["feedUrl"]
    if method == "auto":
        if not source.get("feedUrl"):
            source["feedUrl"] = discover_feed(source["url"])
        return source["feedUrl"]
    raise RuntimeError(f"unsupported fetchMethod: {method}")


def parse_feed(url: str) -> list:
    feed = feedparser.parse(http_get(url).content)
    if feed.bozo and not feed.entries:
        raise RuntimeError(f"RSS/Atom parse failed: {feed.bozo_exception}")
    return feed.entries


def youtube_entries(source: dict) -> list:
    cid = resolve_youtube_channel(source)
    errors = []
    for url in youtube_feed_urls(cid):
        try:
            entries = parse_feed(url)
            source["via"] = "feed"
            return entries
        except Exception as exc:
            errors.append(str(exc)[:120])
    try:
        entries = scrape_youtube_videos(source, cid)
        source["via"] = "channel page"
        print(f"[WARN] {source.get('name')}: feed unavailable, used channel page ({'; '.join(errors)})", file=sys.stderr)
        return entries
    except Exception as exc:
        errors.append(str(exc)[:120])
        raise RuntimeError(" / ".join(errors))


def is_too_old(published: str | None, max_age_days: int) -> bool:
    if not published:
        return False
    try:
        age = datetime.now(timezone.utc) - datetime.fromisoformat(published)
    except ValueError:
        return False
    return age.days > max_age_days


def iso_date(value: str | None) -> str | None:
    try:
        return datetime.fromisoformat((value or "").replace("Z", "+00:00")).astimezone(timezone.utc).isoformat(timespec="seconds")
    except ValueError:
        return None


def zenn_entries(source: dict) -> list[dict]:
    """Zenn has no likes in its RSS, so read the public JSON the site itself uses."""
    articles = []
    for page in (1, 2, 3):  # a few pages so slower topics still reach back a few months
        data = http_get(f"https://zenn.dev/api/articles?topicname={source['topic']}&order=latest&page={page}").json()
        articles += data.get("articles", [])
        if not data.get("next_page"):
            break
    entries = []
    for a in articles:
        user = a.get("user") or {}
        entries.append({
            "link": "https://zenn.dev" + a["path"] if a.get("path") else f"https://zenn.dev/{user.get('username')}/articles/{a.get('slug')}",
            "title": a.get("title", ""),
            "summary": "",
            "publishedApprox": iso_date(a.get("published_at")),
            "author": user.get("name") or user.get("username") or "",
            "likes": a.get("liked_count") or 0,
        })
    return entries


def qiita_entries(source: dict) -> list[dict]:
    """Qiita API v2 (no token: 60 requests/hour, enough for a daily run)."""
    # minLikes is applied after fetching (like counts on these tags are small, so search-side filters miss).
    res = requests.get("https://qiita.com/api/v2/items", params={"query": f"tag:{source['tag']}", "per_page": 100, "page": 1},
                       headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT)
    res.raise_for_status()
    entries = []
    for a in res.json():
        user = a.get("user") or {}
        body = re.sub(r"```.*?```", " ", a.get("body") or "", flags=re.S)
        body = re.sub(r"[#>*`|\[\]()!-]+", " ", body)
        entries.append({
            "link": a.get("url", ""),
            "title": a.get("title", ""),
            "summary": re.sub(r"\s+", " ", body).strip()[:400],
            "publishedApprox": iso_date(a.get("created_at")),
            "author": user.get("name") or user.get("id") or "",
            "likes": a.get("likes_count") or 0,
            "tags": [{"term": t.get("name", "")} for t in a.get("tags") or []],
        })
    return entries


def collect(source: dict, items: dict[str, dict], now: str, active: set[str]) -> int:
    method = source.get("fetchMethod")
    if method == "youtube":
        entries = youtube_entries(source)
    elif method == "zenn":
        entries = zenn_entries(source)
    elif method == "qiita":
        entries = qiita_entries(source)
    else:
        entries = parse_feed(feed_url_for(source))
    keywords = [k.lower() for k in source.get("mustContain", [])]
    excluded = [k.lower() for k in source.get("excludeTitle", [])]
    max_age = int(source.get("maxAgeDays") or DEFAULT_MAX_AGE_DAYS)
    require_tag = source.get("requireTag", True)
    min_bookmarks = int(source.get("minBookmarks") or 0)
    min_likes = int(source.get("minLikes") or 0)
    min_views = int(source.get("minViews") or 0)
    english_only = source.get("titleLang") == "en"
    base_tags = source.get("baseTags") or []
    count = 0
    for entry in entries:
        link = canonical_url(entry.get("link", ""))
        if not link:
            continue
        title = clean_html(entry.get("title", "")) or link
        summary = clean_html(entry.get("summary", "") or entry.get("description", ""))
        if keywords and not any(k in (title + " " + summary).lower() for k in keywords):
            continue
        if any(k in title.lower() for k in excluded):
            continue
        if english_only and JAPANESE.search(title):
            continue
        views = (entry.get("media_statistics") or {}).get("views")
        if min_views and views is not None and int(views) < min_views:
            continue
        published = entry_date(entry) or entry.get("publishedApprox")
        if is_too_old(published, max_age):
            continue
        item_id = stable_id(link)
        previous = items.get(item_id, {})
        bookmarks = entry.get("hatena_bookmarkcount")
        if min_bookmarks and int(bookmarks or 0) < min_bookmarks:
            continue
        likes = entry.get("likes")
        if min_likes and int(likes or 0) < min_likes:
            continue
        # The same article can come from several sources (e.g. Zenn and Hatena Bookmark;
        # LayerX sources are listed first in sources.json so their articles stay in the LayerX tab):
        # keep the first source and only refresh the bookmark count.
        if previous and previous.get("sourceId") != source["id"] and previous.get("sourceId") in active:
            if bookmarks:
                previous["bookmarks"] = int(bookmarks)
            count += 1
            continue
        text = f"{title} {summary} {' '.join(t.get('term', '') for t in entry.get('tags') or [])}"
        estimated = previous.get("tagsEstimated", True)
        tags = with_base(estimate_tags(title, text), base_tags) if estimated else previous.get("tags", [])
        if require_tag and not tags:
            items.pop(item_id, None)
            continue
        items[item_id] = {
            "id": item_id,
            "title": title,
            "url": link,
            "sourceId": source["id"],
            "sourceType": source.get("type", "blog"),
            "publishedAt": entry_date(entry) or previous.get("publishedAt") or entry.get("publishedApprox") or now,
            "lang": source.get("lang") or previous.get("lang") or "ja",
            "tab": source.get("tab") or source.get("lang") or previous.get("tab") or "ja",
            "discoveredAt": previous.get("discoveredAt") or now,
            "description": summary[:400],
            "author": clean_html(entry.get("author", "")) or previous.get("author"),
            "tags": tags,
            "learningTypes": estimate(text, LEARNING_RULES, 2),
            "tagsEstimated": estimated,
            "thumbnailUrl": entry_thumbnail(entry) or previous.get("thumbnailUrl"),
        }
        if bookmarks or previous.get("bookmarks"):
            items[item_id]["bookmarks"] = int(bookmarks or previous.get("bookmarks"))
        if likes is not None:
            items[item_id]["likes"] = int(likes)
        if views is not None:
            items[item_id]["views"] = int(views)
        count += 1
    return count


def existing_items() -> dict[str, dict]:
    try:
        data = json.loads(ITEMS_FILE.read_text(encoding="utf-8"))
        return {x["id"]: x for x in data if isinstance(x, dict) and x.get("id")}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def prune(items: dict[str, dict], sources: dict[str, dict]) -> dict[str, dict]:
    """Re-estimate stored tags with the current rules and drop off-theme or old items."""
    kept = {}
    for item_id, item in items.items():
        source = sources.get(item.get("sourceId"), {})
        if item.get("tagsEstimated", True):
            item["tags"] = with_base(estimate_tags(item.get("title", ""), item.get("description", "")), source.get("baseTags") or [])
        if any(k.lower() in item.get("title", "").lower() for k in source.get("excludeTitle", [])):
            continue
        if source.get("requireTag", True) and not item["tags"]:
            continue
        if is_too_old(item.get("publishedAt"), int(source.get("maxAgeDays") or DEFAULT_MAX_AGE_DAYS)):
            continue
        kept[item_id] = item
    return kept


def main() -> int:
    sources = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    items = existing_items()
    now = iso_now()
    ok = 0
    active = {s["id"] for s in sources if s.get("enabled")}
    for source in sources:
        if not source.get("enabled") or source.get("fetchMethod") in (None, "manual"):
            continue
        source["lastFetchedAt"] = now
        try:
            n = collect(source, items, now, active)
            source["lastSuccessAt"] = now
            source["lastError"] = None
            source["lastCount"] = n
            ok += 1
            print(f'[OK] {source.get("name")}: {n} entries')
        except Exception as exc:
            source["lastError"] = str(exc)[:300]
            print(f'[ERROR] {source.get("name")}: {exc}', file=sys.stderr)

    # Drop items from sources that were removed or disabled.
    items = {k: v for k, v in items.items() if v.get("sourceId") in active}
    items = prune(items, {s["id"]: s for s in sources})
    ordered = sorted(items.values(), key=lambda x: x.get("publishedAt") or "", reverse=True)[:MAX_ITEMS]
    ITEMS_FILE.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SOURCES_FILE.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if ok:
        META_FILE.write_text(json.dumps({"updatedAt": now, "itemCount": len(ordered)}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(ordered)} items to {ITEMS_FILE}")
    # One provider failing must not fail the whole job; errors are kept per source.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
