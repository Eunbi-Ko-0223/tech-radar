"""
1단계 (재현율 우선) — arXiv에서 반도체 관련 후보 논문을 '넓게' 긁어온다.
설계 원칙: arXiv 쿼리 = 그물(넓게), LLM = 체(정밀하게, analyze.py 담당)
"""
import datetime
import arxiv


def build_query(cfg):
    """config의 카테고리 + 키워드 클러스터로 arXiv 검색 쿼리를 조립한다."""
    a = cfg["arxiv"]

    # (1) 카테고리 화이트리스트 — 무관한 분야를 1차로 거른다
    cat_clause = " OR ".join(f"cat:{c}" for c in a["categories"])

    # (2-a) 명확한 단어 — 단독으로 써도 안전
    clear_clause = " OR ".join(f'all:"{t}"' for t in a["clear_terms"])

    # (2-b) 모호한 단어 — 반드시 반도체 앵커어와 동시 등장해야 함
    ambiguous_parts = []
    for item in a["ambiguous_terms"]:
        anchors = " OR ".join(f'all:"{x}"' for x in item["anchors"])
        ambiguous_parts.append(f'(all:"{item["term"]}" AND ({anchors}))')
    ambiguous_clause = " OR ".join(ambiguous_parts)

    keyword_clause = f"({clear_clause}) OR ({ambiguous_clause})"

    # 카테고리 AND 키워드 → 둘 다 만족하는 논문만
    return f"({cat_clause}) AND ({keyword_clause})"


def fetch_candidates(cfg, verbose=True):
    """검색일 기준 최근 lookback_days 이내의 후보 논문 리스트를 반환한다.

    arXiv를 제출일 내림차순으로 받아오며, lookback_days를 벗어난 논문이 나오면
    (정렬되어 있으므로) 이후는 더 볼 필요가 없어 조회를 멈춘다.
    """
    a = cfg["arxiv"]
    query = build_query(cfg)
    lookback = a.get("lookback_days", 30)
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=lookback)
    if verbose:
        print(f"[fetch] arXiv 쿼리 길이: {len(query)}자 / 기간: 최근 {lookback}일 "
              f"(>= {cutoff.date()})")

    search = arxiv.Search(
        query=query,
        max_results=a.get("max_fetch", 120),
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending,
    )
    client = arxiv.Client(page_size=50, delay_seconds=3, num_retries=3)

    papers = []
    for r in client.results(search):
        if r.published < cutoff:
            break  # 정렬되어 있으므로 여기부터는 모두 기간 밖
        arxiv_id = r.entry_id.split("/abs/")[-1].split("v")[0]
        papers.append({
            "arxiv_id": arxiv_id,
            "title": r.title.strip().replace("\n", " "),
            "abstract": r.summary.strip().replace("\n", " "),
            "authors": [au.name for au in r.authors],
            "published": r.published.strftime("%Y-%m-%d"),
            "primary_category": r.primary_category,
            "url": r.entry_id,
        })
        if len(papers) >= a.get("max_candidates", 60):
            break  # 안전 상한

    if verbose:
        print(f"[fetch] 후보 논문 {len(papers)}편 수집 완료 (최근 {lookback}일)")
    return papers


if __name__ == "__main__":
    import json
    cfg = json.load(open("config.json", encoding="utf-8"))
    for i, p in enumerate(fetch_candidates(cfg), 1):
        print(f"{i:2d}. [{p['published']}] {p['title']}")
