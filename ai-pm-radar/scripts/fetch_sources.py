#!/usr/bin/env python3
"""Collect public sources on AI-era product management, engineering management,
product development and org building into data/items.json without any API key.

Supported fetchMethod values (all keyless):
  rss      : RSS/Atom feed at feedUrl (blog, Speaker Deck .atom, etc.)
  youtube  : YouTube's public channel feed
             https://www.youtube.com/feeds/videos.xml?channel_id=UC...
             channelId is resolved automatically from a known video
             (resolveFromVideo) or channel page (resolveFromUrl) and saved.
  auto     : fetch the page at url and use its <link rel="alternate"> feed.
  manual   : not collected.

Optional per-source fields:
  lang         : "ja" / "en" (stored on each item)
  tab          : which tab of the app shows the items (default: lang; "layerx" for the LayerX tab)
  tagRules     : "tech" to estimate tags with the engineering rules (LayerX tab)
  mustContain  : keep only entries whose title/summary contains one of these words
  maxAgeDays   : skip entries older than this (default 400)

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
USER_AGENT = "Mozilla/5.0 (compatible; AI-PM-Radar/1.0; personal public-source aggregator)"
TIMEOUT = 25
MAX_ITEMS = 1500
DEFAULT_MAX_AGE_DAYS = 400

# Keyword rules for estimated tags (Japanese + English). Lower-case matching.
TAG_RULES = {
    "AI活用": ["ai", "llm", "生成ai", "agent", "agents", "agentic", "エージェント", "gpt", "chatgpt", "claude", "gemini", "copilot",
              "cursor", "rag", "プロンプト", "prompt", "mcp", "vibe coding", "バイブコーディング", "ai駆動", "ai-native", "aiネイティブ",
              "machine learning", "機械学習", "openai", "anthropic", "evals"],
    "プロダクトマネジメント": ["pdm", "pm", "pms", "product manager", "product managers", "product management", "プロダクトマネージャー",
                        "プロダクトマネジメント", "ロードマップ", "roadmap", "prd", "優先順位", "prioritization", "product strategy",
                        "プロダクト戦略", "pmf", "product-market fit", "product sense", "product leader"],
    "エンジニアリングマネジメント": ["em", "ems", "エンジニアリングマネージャー", "エンジニアリングマネジメント", "engineering manager",
                            "engineering managers", "engineering management", "engineering leader", "engineering leadership",
                            "1on1", "1on1s", "one-on-one", "テックリード", "tech lead", "vpoe", "cto", "staff engineer",
                            "マネージャー", "managers", "リーダーシップ", "leadership"],
    "プロダクト開発": ["プロダクト開発", "product development", "開発プロセス", "アジャイル", "agile", "スクラム", "scrum", "リリース",
                "shipping", "delivery", "mvp", "プロトタイプ", "prototype", "prototyping", "仕様", "spec", "機能開発", "building products"],
    "ディスカバリー・UX": ["discovery", "ディスカバリー", "ユーザーインタビュー", "customer interview", "ux", "ユーザー体験", "仮説検証",
                    "仮説", "experiment", "experimentation", "user research", "ユーザーリサーチ", "jobs to be done", "jtbd", "デザイン"],
    "組織づくり": ["組織", "組織づくり", "組織開発", "org design", "organization", "organizational", "チーム", "チームづくり", "team topologies",
              "チームトポロジー", "カルチャー", "culture", "文化", "心理的安全性", "psychological safety", "オンボーディング", "onboarding",
              "reorg", "re-org"],
    "採用・育成・キャリア": ["採用", "hiring", "recruiting", "育成", "評価", "performance review", "performance reviews", "キャリア", "career",
                    "promotion", "昇進", "昇格", "メンタリング", "mentoring", "コーチング", "coaching", "layoffs", "interviewing", "ジュニア"],
    "戦略・経営": ["戦略", "strategy", "経営", "ceo", "founder", "founders", "事業", "okr", "okrs", "kpi", "意思決定", "decision-making",
              "スタートアップ", "startup", "startups", "pricing", "価格", "growth", "グロース", "business model"],
    "開発生産性": ["生産性", "productivity", "devex", "developer experience", "開発者体験", "dora", "four keys", "自動化", "automation",
              "効率化", "velocity", "リードタイム", "lead time"],
    "データ・指標": ["データ", "data", "metrics", "指標", "analytics", "分析", "a/b", "ab test", "ab testing", "north star", "kpi", "計測"],
}
LEARNING_RULES = {
    "実践事例": ["やってみた", "導入", "事例", "実践", "取り組み", "運用", "移行", "改善", "how we", "case study", "lessons", "learned"],
    "考え方・フレームワーク": ["フレームワーク", "framework", "考え方", "原則", "principles", "mental model", "playbook", "how to", "guide", "入門"],
    "インタビュー・対談": ["インタビュー", "interview", "対談", "podcast", "ポッドキャスト", "conversation", "ゲスト", "聞いた"],
    "組織・プロセス": ["組織", "チーム", "プロセス", "process", "採用", "文化", "culture", "マネジメント", "management", "team"],
    "トレンド・調査": ["トレンド", "trend", "trends", "調査", "survey", "report", "レポート", "state of", "未来", "future", "予測"],
}


# Engineering rules for the LayerX tab (formerly LayerX Radar).
TECH_TAG_RULES = {
    "AI活用": ["ai", "llm", "agent", "エージェント", "生成ai", "gpt", "claude", "gemini", "rag", "プロンプト", "mcp", "機械学習", "ml"],
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
TECH_LEARNING_RULES = {
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
        vid = title = when = desc = None
        if "videoRenderer" in node:
            r = node["videoRenderer"]
            vid, title = r.get("videoId"), text_of(r.get("title"))
            when, desc = text_of(r.get("publishedTimeText")), text_of(r.get("descriptionSnippet"))
        elif "lockupViewModel" in node:
            r = node["lockupViewModel"]
            if "VIDEO" not in str(r.get("contentType", "VIDEO")):
                continue
            vid = r.get("contentId")
            meta = (r.get("metadata") or {}).get("lockupMetadataViewModel") or {}
            title = text_of(meta.get("title"))
            rows = [text_of(p.get("text")) for n in walk(meta.get("metadata")) for p in n.get("metadataParts", [])]
            when = next((t for t in rows if "前" in t or "ago" in t), None)
        if not vid or not title or vid in seen or not re.fullmatch(r"[\w-]{11}", vid):
            continue
        seen.add(vid)
        entries.append({
            "link": "https://www.youtube.com/watch?v=" + vid,
            "title": title,
            "summary": desc or "",
            "publishedApprox": approx_date(when, now) if when else None,
            "media_thumbnail": [{"url": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"}],
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


def collect(source: dict, items: dict[str, dict], now: str, active: set[str]) -> int:
    if source.get("fetchMethod") == "youtube":
        entries = youtube_entries(source)
    else:
        entries = parse_feed(feed_url_for(source))
    keywords = [k.lower() for k in source.get("mustContain", [])]
    max_age = int(source.get("maxAgeDays") or DEFAULT_MAX_AGE_DAYS)
    tech = source.get("tagRules") == "tech"
    tag_rules, learning_rules = (TECH_TAG_RULES, TECH_LEARNING_RULES) if tech else (TAG_RULES, LEARNING_RULES)
    count = 0
    for entry in entries:
        link = canonical_url(entry.get("link", ""))
        if not link:
            continue
        title = clean_html(entry.get("title", "")) or link
        summary = clean_html(entry.get("summary", "") or entry.get("description", ""))
        if keywords and not any(k in (title + " " + summary).lower() for k in keywords):
            continue
        published = entry_date(entry) or entry.get("publishedApprox")
        if is_too_old(published, max_age):
            continue
        item_id = stable_id(link)
        previous = items.get(item_id, {})
        bookmarks = entry.get("hatena_bookmarkcount")
        # The same article can come from several sources (e.g. Zenn and Hatena Bookmark;
        # LayerX sources are listed first in sources.json so their articles stay in the LayerX tab):
        # keep the first source and only refresh the bookmark count.
        if previous and previous.get("sourceId") != source["id"] and previous.get("sourceId") in active:
            if bookmarks:
                previous["bookmarks"] = int(bookmarks)
            count += 1
            continue
        text = f"{title} {summary} {' '.join(t.get('term', '') for t in entry.get('tags') or [])}"
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
            "tags": previous.get("tags") or estimate(text, tag_rules, 4),
            "learningTypes": previous.get("learningTypes") or estimate(text, learning_rules, 2),
            "tagsEstimated": previous.get("tagsEstimated", True),
            "thumbnailUrl": entry_thumbnail(entry) or previous.get("thumbnailUrl"),
        }
        if bookmarks or previous.get("bookmarks"):
            items[item_id]["bookmarks"] = int(bookmarks or previous.get("bookmarks"))
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
