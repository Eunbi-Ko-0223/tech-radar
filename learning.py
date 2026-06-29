"""
학습 패키지 — Semantic Scholar 인용 그래프로 '함께 공부하면 좋은 논문'을 찾는다.
References(인용한 논문) = 선행지식/토대 논문. survey/review는 비전공자에게 최고의 배경 자료.
"""
import requests

S2_URL = "https://api.semanticscholar.org/graph/v1/paper/arXiv:{aid}"
SURVEY_HINTS = ("survey", "review", "overview", "tutorial", "introduction to")


def get_references(arxiv_id, limit=20):
    """arXiv ID로 참고문헌 목록을 가져온다. 실패 시 빈 리스트(프로토타입은 graceful)."""
    try:
        resp = requests.get(
            S2_URL.format(aid=arxiv_id),
            params={"fields": "references.title,references.year"},
            timeout=20,
        )
        if resp.status_code != 200:
            print(f"[learning] Semantic Scholar 응답 {resp.status_code} — 참고문헌 생략")
            return []
        refs = resp.json().get("references", []) or []
    except Exception as e:
        print(f"[learning] 참고문헌 조회 실패({e}) — 생략")
        return []

    out = []
    for r in refs:
        title = (r.get("title") or "").strip()
        if not title:
            continue
        out.append({
            "title": title,
            "year": r.get("year"),
            "is_survey": any(h in title.lower() for h in SURVEY_HINTS),
        })
    # survey/review를 앞쪽으로 정렬 → LLM이 배경 논문 고를 때 우선 노출
    out.sort(key=lambda x: not x["is_survey"])
    return out[:limit]
