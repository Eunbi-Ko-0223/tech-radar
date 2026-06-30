"""
1단계 (재현율 우선) — arXiv에서 후보 논문을 '넓게' 긁어온다.
설계 원칙: arXiv 쿼리 = 그물(넓게), LLM = 체(정밀하게, analyze.py 담당)

두 트랙을 따로 수집한다(각자 상한):
 - 반도체 트랙: 메모리·소자·패키징 등 (주력)
 - AI 전방시장 트랙: 대형 모델·AI 인프라 트렌드 (메모리 수요 견인)
AI 논문은 양이 많아 그냥 합치면 반도체를 밀어내므로, 트랙별 상한으로 균형을 맞춘다.
"""
import time
import datetime
import arxiv


def build_query(categories, clear_terms, ambiguous_terms):
    """카테고리 + 키워드 클러스터로 arXiv 검색 쿼리를 조립한다."""
    cat_clause = " OR ".join(f"cat:{c}" for c in categories)

    # 명확한 단어 — 단독으로 써도 안전
    clear_clause = " OR ".join(f'all:"{t}"' for t in clear_terms)

    # 모호한 단어 — 반드시 앵커어와 동시 등장해야 함
    ambiguous_parts = []
    for item in (ambiguous_terms or []):
        anchors = " OR ".join(f'all:"{x}"' for x in item["anchors"])
        ambiguous_parts.append(f'(all:"{item["term"]}" AND ({anchors}))')

    if ambiguous_parts:
        keyword_clause = f"({clear_clause}) OR ({' OR '.join(ambiguous_parts)})"
    else:
        keyword_clause = f"({clear_clause})"

    # 카테고리 AND 키워드 → 둘 다 만족하는 논문만
    return f"({cat_clause}) AND ({keyword_clause})"


def _fetch_track(query, cap, cutoff, client, track, verbose):
    """한 트랙의 쿼리를 제출일 내림차순으로 받아 cutoff 이내 cap편까지 반환.
    arXiv 일시 오류(429 등)는 백오프 재시도, 그래도 실패하면 빈 목록(작업 안 죽음)."""
    for attempt in range(1, 4):
        try:
            search = arxiv.Search(
                query=query,
                max_results=cap,
                sort_by=arxiv.SortCriterion.SubmittedDate,
                sort_order=arxiv.SortOrder.Descending,
            )
            papers = []
            for r in client.results(search):
                if r.published < cutoff:
                    break  # 정렬되어 있으므로 여기부터는 기간 밖
                arxiv_id = r.entry_id.split("/abs/")[-1].split("v")[0]
                papers.append({
                    "arxiv_id": arxiv_id,
                    "title": r.title.strip().replace("\n", " "),
                    "abstract": r.summary.strip().replace("\n", " "),
                    "authors": [au.name for au in r.authors],
                    "published": r.published.strftime("%Y-%m-%d"),
                    "primary_category": r.primary_category,
                    "track": track,
                    "url": r.entry_id,
                })
                if len(papers) >= cap:
                    break
            if verbose:
                print(f"[fetch:{track}] {len(papers)}편 수집")
            return papers
        except Exception as e:
            wait = 30 * attempt
            print(f"[fetch:{track}] arXiv 실패({type(e).__name__}: {e}) — {wait}s 후 재시도 {attempt}/3")
            time.sleep(wait)
    print(f"[fetch:{track}] 반복 실패 — 이 트랙은 건너뜀")
    return []


def fetch_candidates(cfg, track=None, verbose=True):
    """후보 논문을 수집한다. track="AI" 또는 "반도체"면 해당 트랙만, None이면 둘 다.
    각 트랙은 자체 상한을 가진다(AI가 반도체를 밀어내지 않도록)."""
    a = cfg["arxiv"]
    lookback = a.get("lookback_days", 30)
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=lookback)
    client = arxiv.Client(page_size=50, delay_seconds=5, num_retries=3)
    do_semi = track in (None, "all", "반도체")
    do_ai = track in (None, "all", "AI") and a.get("ai_categories") and a.get("ai_terms")
    if verbose:
        print(f"[fetch] 기간: 최근 {lookback}일 (>= {cutoff.date()}) / 트랙: {track or '전체'}")

    papers = []
    # ── 반도체 트랙 ──
    if do_semi:
        semi_q = build_query(a["categories"], a["clear_terms"], a.get("ambiguous_terms"))
        papers += _fetch_track(semi_q, a.get("max_candidates", 60), cutoff, client, "반도체", verbose)

    # ── AI 전방시장 트랙 ──
    if do_ai:
        ai_q = build_query(a["ai_categories"], a["ai_terms"], None)
        ai_papers = _fetch_track(ai_q, a.get("ai_max_candidates", 25), cutoff, client, "AI", verbose)
        have = {p["arxiv_id"] for p in papers}
        for p in ai_papers:
            if p["arxiv_id"] not in have:
                papers.append(p)
                have.add(p["arxiv_id"])

    if verbose:
        print(f"[fetch] 총 후보 {len(papers)}편 (최근 {lookback}일)")
    return papers


if __name__ == "__main__":
    import json
    cfg = json.load(open("config.json", encoding="utf-8"))
    for i, p in enumerate(fetch_candidates(cfg), 1):
        print(f"{i:2d}. [{p.get('track','-')}] [{p['published']}] {p['title']}")
