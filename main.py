"""
반도체 기술 레이더 — 핵심 로직 프로토타입 (수집 → 선별 → 통역 → 학습패키지)
하루 한 편(best pick)을 선정해 날짜별로 저장하고, 읽기 좋은 리포트를 출력한다.

사용법:
  python main.py            # 전체 파이프라인 (LLM 필요, ANTHROPIC_API_KEY 설정)
  python main.py --dry-run  # 수집(1단계)만 — API 키 없이 그물망 동작 확인
"""
import sys
import os
import json
import datetime

# Windows 콘솔에서 한글이 깨지지 않도록 UTF-8로 출력
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import fetch

HERE = os.path.dirname(os.path.abspath(__file__))


def load_env():
    """같은 폴더의 .env 파일에서 환경변수를 읽어온다(외부 패키지 불필요).
    키는 .env(=.gitignore 처리됨)에만 두고, 코드/저장소에는 절대 넣지 않는다."""
    path = os.path.join(HERE, ".env")
    if not os.path.exists(path):
        return
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def load_config():
    return json.load(open(os.path.join(HERE, "config.json"), encoding="utf-8"))


import re
_DATE_FILE = re.compile(r"^\d{4}-\d{2}-\d{2}\.json$")


def recommended_ids():
    """이미 추천된 논문들의 arxiv_id 집합. output/의 날짜 파일들이 곧 '추천 기록 DB'."""
    ids = set()
    out_dir = os.path.join(HERE, "output")
    if os.path.isdir(out_dir):
        for fn in os.listdir(out_dir):
            if _DATE_FILE.match(fn):
                try:
                    rec = json.load(open(os.path.join(out_dir, fn), encoding="utf-8"))
                    aid = rec.get("paper", {}).get("arxiv_id")
                    if aid:
                        ids.add(aid)
                except Exception:
                    pass
    return ids


def run(dry_run=False):
    load_env()
    cfg = load_config()
    today = datetime.date.today().isoformat()
    print(f"\n=== 반도체 기술 레이더 · {today} ===\n")

    # ── 1단계: 수집 (그물) ──
    candidates = fetch.fetch_candidates(cfg)
    if not candidates:
        print("수집된 논문이 없습니다. (검색어/기간을 조정해 보세요)")
        return

    # ── 중복 방지: 이미 추천한 논문은 후보에서 제외(채점 전에 빼 비용도 절감) ──
    seen = recommended_ids()
    if seen:
        before = len(candidates)
        candidates = [c for c in candidates if c["arxiv_id"] not in seen]
        print(f"[중복방지] 이미 추천한 {len(seen)}편 제외 → 후보 {before}→{len(candidates)}편")
    if not candidates:
        print("새로 추천할 논문이 없습니다. (최근 30일 후보를 모두 추천함)")
        return

    if dry_run:
        print("\n[--dry-run] 수집된 후보 (LLM 선별 전):\n")
        for i, p in enumerate(candidates, 1):
            print(f"{i:2d}. [{p['published']}] {p['title']}")
        print("\n→ API 키를 설정하면 이 후보들을 점수화해 오늘의 1편을 골라줍니다.")
        return

    # 여기부터는 LLM 필요
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("\n[!] ANTHROPIC_API_KEY가 없습니다.")
        print("    .env.example을 복사해 .env를 만들고 키를 넣거나,")
        print('    PowerShell에서  $env:ANTHROPIC_API_KEY="sk-ant-..."  로 설정하세요.')
        print("    (수집만 확인하려면  python main.py --dry-run )")
        return

    import analyze
    import learning

    # ── 2단계: 선별 (체) — 후보별 점수화 ──
    print("\n[선별] 후보 논문 점수화 중...")
    scored = []
    for i, p in enumerate(candidates, 1):
        try:
            r = analyze.score_paper(cfg, p)
        except Exception as e:
            print(f"  {i:2d}. 점수화 실패({e}) — 건너뜀")
            continue
        p["analysis"] = r
        mark = "✓" if r.get("is_relevant") else "✗(무관)"
        print(f"  {i:2d}. {mark} score={r['final_score']:>5} [{r.get('tag','-')}] {p['title'][:55]}")
        if r.get("is_relevant"):
            scored.append(p)

    if not scored:
        print("\n반도체 관련 논문이 없었습니다. (오늘은 추천 없음)")
        return

    # ── best pick 선정 ──
    scored.sort(key=lambda p: p["analysis"]["final_score"], reverse=True)
    winner = scored[0]
    print(f"\n[선정] 오늘의 논문: {winner['title']}")

    # ── 학습 패키지: 참고문헌 조회 ──
    refs = learning.get_references(winner["arxiv_id"])
    print(f"[학습] 참고문헌 {len(refs)}편 확보 (survey 우선 정렬)")

    # ── 본문 확보(초록만으론 깊이 부족) ──
    import paper_text
    full_text = paper_text.get_fulltext(winner["arxiv_id"])
    based_on = "fulltext" if full_text else "abstract"
    if not full_text:
        print("[경고] PDF 본문을 못 받았습니다 → 오늘은 초록 기반(깊이 낮음). based_on=abstract")

    # ── 3단계: 통역 — 본문 기반 심층 분석(v2) ──
    print("[통역] 본문 기반 비전공자용 심층 분석 중...")
    deep = analyze.deep_analyze(cfg, winner, refs, full_text=full_text)

    record = {
        "date": today,
        "paper": {k: winner[k] for k in ("title", "authors", "published", "url", "arxiv_id")},
        "tag": winner["analysis"]["tag"],
        "scores": winner["analysis"]["scores"],
        "final_score": winner["analysis"]["final_score"],
        "based_on": based_on,
        "deep": deep,
    }
    save_and_report(record)


def save_and_report(record):
    out_dir = os.path.join(HERE, "output")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{record['date']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(record, f, ensure_ascii=False, indent=2)

    p, d = record["paper"], record["deep"]
    print("\n" + "=" * 60)
    print(f"📅 {record['date']}  오늘의 논문   [{record['tag']}]")
    print("=" * 60)
    print(f"\n📄 {p['title']}")
    print(f"   {p['url']}  (제출 {p['published']})")
    def show_sections(title, sections, fallback_key):
        print(f"\n{title}")
        if sections:
            for s in sections:
                print(f"   ▸ {s.get('heading','')}\n     {s.get('body','')}")
        elif d.get(fallback_key):
            print(f"   {d[fallback_key]}")

    show_sections("🔎 쉬운 요약", d.get("summary_sections"), "easy_summary")
    if d.get("key_terms"):
        print("\n📖 용어 풀이")
        for t in d["key_terms"]:
            print(f"   · {t['term']}: {t['explain']}")
    show_sections(f"💡 SK하이닉스에게 무슨 의미? ({record['tag']})",
                  d.get("implication_sections"), "why_matters")
    if d.get("background_papers"):
        print("\n📚 함께 공부하면 좋은 논문 (학습 패키지)")
        for b in d["background_papers"]:
            print(f"   · {b['title']}\n     → {b['why']}")
        print(f"   순서: {d.get('reading_order','')}")
    print(f"\n💾 저장됨: {path}")
    print("=" * 60)


if __name__ == "__main__":
    run(dry_run="--dry-run" in sys.argv)
