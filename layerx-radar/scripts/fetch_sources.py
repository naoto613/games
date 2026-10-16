#!/usr/bin/env python3
"""Collect LayerX public sources into data/items.json without any API key.

Supported fetchMethod values (all keyless):
  rss      : RSS/Atom feed at feedUrl (blog, Speaker Deck .atom, etc.)
  youtube  : YouTube's public channel feed
             https://www.youtube.com/feeds/videos.xml?channel_id=UC...
             channelId is resolved automatically from a known video
             (resolveFromVideo) or channel page (resolveFromUrl) and saved.
  auto     : fetch the page at url and use its <link rel="alternate"> feed.
  manual   : not collected.

Tags are estimated by simple keyword rules (no AI / no key), and items keep
any tags already stored.
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
USER_AGENT = "Mozilla/5.0 (compatible; LayerX-Radar/1.1; personal public-source aggregator)"
TIMEOUT = 25
MAX_ITEMS = 1500

# Keyword rules for estimated tags. Lower-case matching.
TAG_RULES = {
    "AI・LLM・Agent": ["ai", "llm", "agent", "エージェント", "生成ai", "gpt", "claude", "gemini", "rag", "プロンプト", "mcp", "機械学習", "ml"],
    "アーキテクチャ": ["アーキテクチャ", "architecture", "設計", "ddd", "ドメイン", "マイクロサービス", "モノリス", "モジュラー"],
    "バックエンド": ["go", "golang", "api", "mysql", "postgres", "データベース", "db", "sql", "バックエンド", "backend", "grpc", "rails", "python"],
    "フロントエンド": ["react", "typescript", "フロントエンド", "frontend", "next.js", "css", "ui", "デザインシステム", "javascript"],
    "Platform Engineering": ["platform", "プラットフォーム", "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "基盤"],
    "SRE・インフラ": ["sre", "aws", "gcp", "インフラ", "監視", "observability", "オブザーバビリティ", "障害", "信頼性", "ecs", "インシデント"],
    "セキュリティ": ["セキュリティ", "security", "脆弱性", "認証", "認可", "privacy", "プライバシー", "コンプライアンス"],
    "品質・テスト": ["テスト", "test", "qa", "品質", "e2e", "playwright"],
    "開発生産性": ["生産性", "productivity", "開発体験", "devex", "dx", "自動化", "効率化", "ai駆動"],
    "プロダクト開発": ["プロダクト", "product", "pdm", "バクラク", "機能開発", "リリース", "ux"],
    "EM・組織設計": ["em", "組織", "マネジメント", "採用", "チーム", "1on1", "オンボーディング", "キャリア", "育休", "カルチャー"],
    "事業・技術戦略": ["戦略", "経営", "cto", "ceo", "事業", "ロードマップ", "fintech", "bet"],
}
LEARNING_RULES = {
    "実践事例": ["やってみた", "導入", "事例", "実践", "取り組み", "運用", "移行", "改善"],
    "設計判断": ["設計", "選定", "トレードオフ", "なぜ", "判断", "比較"],
    "組織・プロセス": ["組織", "チーム", "プロセス", "採用", "文化", "カルチャー", "マネジメント"],
    "思想・戦略": ["戦略", "構想", "ビジョン", "未来", "時代", "考え方"],
    "イベント・登壇": ["登壇", "イベント", "カンファレンス", "勉強会", "meetup", "live", "ウェビナー", "資料"],
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


def scrape_youtube_videos(cid: str) -> list[dict]:
    """Last resort without a key: read video ids and titles from the channel's videos page."""
    html = http_get(f"https://www.youtube.com/channel/{cid}/videos?hl=ja").text
    now = datetime.now(timezone.utc)
    entries, seen = [], set()
    for m in re.finditer(r'"videoRenderer":\{"videoId":"([\w-]{11})"', html):
        vid = m.group(1)
        if vid in seen:
            continue
        chunk = html[m.end():m.end() + 6000]
        t = re.search(r'"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"', chunk)
        if not t:
            continue
        seen.add(vid)
        d = re.search(r'"publishedTimeText":\{"simpleText":"([^"]+)"', chunk)
        desc = re.search(r'"descriptionSnippet":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"', chunk)
        entries.append({
            "link": "https://www.youtube.com/watch?v=" + vid,
            "title": json.loads('"' + t.group(1) + '"'),
            "summary": json.loads('"' + desc.group(1) + '"') if desc else "",
            "publishedApprox": approx_date(d.group(1), now) if d else None,
            "media_thumbnail": [{"url": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"}],
        })
    if not entries:
        raise RuntimeError("no videos found on the channel page")
    return entries


def discover_feed(page_url: str) -> str:
    html = http_get(page_url).text
    for tag in re.findall(r"<link\b[^>]*>", html, flags=re.I):
        if re.search(r'rel=["\']?alternate', tag, re.I) and re.search(r"application/(rss|atom)\+xml", tag, re.I):
            m = re.search(r'href=["\']([^"\']+)', tag, re.I)
            if m:
                return urljoin(page_url, unescape(m.group(1)))
    raise RuntimeError("no RSS/Atom <link rel=alternate> found on the page")


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
        entries = scrape_youtube_videos(cid)
        source["via"] = "channel page"
        print(f"[WARN] {source.get('name')}: feed unavailable, used channel page ({'; '.join(errors)})", file=sys.stderr)
        return entries
    except Exception as exc:
        errors.append(str(exc)[:120])
        raise RuntimeError(" / ".join(errors))


def collect(source: dict, items: dict[str, dict], now: str) -> int:
    if source.get("fetchMethod") == "youtube":
        entries = youtube_entries(source)
    else:
        entries = parse_feed(feed_url_for(source))
    keywords = [k.lower() for k in source.get("mustContain", [])]
    count = 0
    for entry in entries:
        link = canonical_url(entry.get("link", ""))
        if not link:
            continue
        title = clean_html(entry.get("title", "")) or link
        summary = clean_html(entry.get("summary", "") or entry.get("description", ""))
        if keywords and not any(k in (title + " " + summary).lower() for k in keywords):
            continue
        item_id = stable_id(link)
        previous = items.get(item_id, {})
        text = f"{title} {summary} {' '.join(t.get('term', '') for t in entry.get('tags') or [])}"
        items[item_id] = {
            "id": item_id,
            "title": title,
            "url": link,
            "sourceId": source["id"],
            "sourceType": source.get("type", "blog"),
            "publishedAt": entry_date(entry) or previous.get("publishedAt") or entry.get("publishedApprox") or now,
            "discoveredAt": previous.get("discoveredAt") or now,
            "description": summary[:400],
            "author": clean_html(entry.get("author", "")) or previous.get("author"),
            "tags": previous.get("tags") or estimate(text, TAG_RULES, 4),
            "learningTypes": previous.get("learningTypes") or estimate(text, LEARNING_RULES, 2),
            "tagsEstimated": previous.get("tagsEstimated", True),
            "thumbnailUrl": entry_thumbnail(entry) or previous.get("thumbnailUrl"),
        }
        count += 1
    return count


def existing_items() -> dict[str, dict]:
    try:
        data = json.loads(ITEMS_FILE.read_text(encoding="utf-8"))
        return {x["id"]: x for x in data if isinstance(x, dict) and x.get("id")}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def main() -> int:
    sources = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    items = existing_items()
    now = iso_now()
    ok = 0
    for source in sources:
        if not source.get("enabled") or source.get("fetchMethod") in (None, "manual"):
            continue
        source["lastFetchedAt"] = now
        try:
            n = collect(source, items, now)
            source["lastSuccessAt"] = now
            source["lastError"] = None
            source["lastCount"] = n
            ok += 1
            print(f'[OK] {source.get("name")}: {n} entries')
        except Exception as exc:
            source["lastError"] = str(exc)[:300]
            print(f'[ERROR] {source.get("name")}: {exc}', file=sys.stderr)

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
