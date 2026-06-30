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


# 한국시간(KST = UTC+9, 서머타임 없음). GitHub 서버는 UTC라, 날짜를 KST로 계산해야
# 'cron 21:00 UTC = 06:00 KST' 실행 시 날짜가 하루 밀리지 않는다.
KST = datetime.timezone(datetime.timedelta(hours=9))


# 요일별 트랙: 월/수/금 = AI 전방시장, 화/목 = 반도체. 주말은 미발행.
# (Python weekday(): 월0 화1 수2 목3 금4 토5 일6)
AI_DAYS = {0, 2, 4}
SEMI_DAYS = {1, 3}


def run(dry_run=False):
    load_env()
    cfg = load_config()
    now_kst = datetime.datetime.now(KST)
    today = now_kst.date().isoformat()
    weekday = now_kst.weekday()
    print(f"\n=== 반도체 테크레터 · {today} (KST) ===\n")

    # ── 주말 미발행: 출근일(월~금)에만 발행 ──
    if weekday in AI_DAYS:
        track = "AI"
    elif weekday in SEMI_DAYS:
        track = "반도체"
    else:
        print("주말에는 테크레터를 발행하지 않습니다 (출근길 셔틀용 — 평일만). ☕")
        return
    print(f"오늘은 [{track}] 트랙입니다.")

    # ── 멱등성: 오늘 이미 처리했으면 건너뜀(매일 1편/재실행 시 덮어쓰기 방지) ──
    today_file = os.path.join(HERE, "output", f"{today}.json")
    if not dry_run and os.path.exists(today_file):
        print(f"오늘({today})은 이미 처리되었습니다 → 건너뜁니다.")
        print(f"  (다시 돌리려면 {today_file} 삭제 후 재실행)")
        return

    # ── 1단계: 수집 (그물) — 오늘 트랙만, 최근 30일 ──
    candidates = fetch.fetch_candidates(cfg, track=track)
    if not candidates:
        print("수집된 논문이 없습니다. (검색어/기간을 조정해 보세요)")
        return

    seen = recommended_ids()  # 이미 추천된 논문(추천완료 DB)

    if dry_run:
        preview = [c for c in candidates if c["arxiv_id"] not in seen]
        print("\n[--dry-run] 수집된 후보 (이미 추천한 것 제외):\n")
        for i, p in enumerate(preview, 1):
            print(f"{i:2d}. [{p['published']}] {p['title']}")
        print("\n→ API 키를 설정하면 신규만 점수화해 오늘의 1편을 골라줍니다.")
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
    import pool as poolmod

    lookback = cfg["arxiv"].get("lookback_days", 30)
    min_score = cfg["rubric"].get("min_score", {}).get("value", 0)

    # ── 후보 풀 DB 갱신 ──
    pool = poolmod.load_pool()
    # 이미 추천된 논문이 풀에 남아있으면 제거(안전)
    for aid in [a for a in pool if a in seen]:
        del pool[aid]
    removed_old = poolmod.prune_old(pool, lookback)  # 30일 지난 미추천 제거

    # ── 2단계: 선별 (체) — 신규 논문만 채점(증분) ──
    new_papers = [c for c in candidates
                  if c["arxiv_id"] not in pool and c["arxiv_id"] not in seen]
    print(f"\n[선별] 캐시 재사용 {len(pool)}편 · 만료 제거 {removed_old}편 · "
          f"신규 채점 {len(new_papers)}편")
    for i, p in enumerate(new_papers, 1):
        try:
            r = analyze.score_paper(cfg, p)
        except Exception as e:
            print(f"  신규 {i:2d}. 점수화 실패({e}) — 건너뜀")
            continue
        p["analysis"] = r
        p["first_seen"] = today
        pool[p["arxiv_id"]] = p
        mark = "✓" if r.get("is_relevant") else "✗(무관)"
        print(f"  신규 {i:2d}. {mark} score={r['final_score']:>5} [{r.get('tag','-')}] {p['title'][:50]}")
    poolmod.save_pool(pool)  # 채점 결과 캐싱

    # ── best pick 선정: 풀에서 '오늘 트랙'의 관련 논문 중 최고점 ──
    # (track 필드 없는 과거 항목은 반도체로 간주 — 반도체 전용 시절 데이터)
    candidates_scored = [p for p in pool.values()
                         if p.get("analysis", {}).get("is_relevant")
                         and p.get("track", "반도체") == track]
    if not candidates_scored:
        print(f"\n풀에 [{track}] 관련 논문이 없습니다 → 오늘은 추천 없음 ☕")
        save_skip(today, 0, min_score)
        return

    winner = max(candidates_scored, key=lambda p: p["analysis"]["final_score"])
    top = winner["analysis"]["final_score"]

    # ── 품질 기준선: 최고점조차 기준 미만이면 '오늘은 추천 없음' ──
    if top < min_score:
        print(f"\n[기준선] 최고점 {top} < 기준선 {min_score} → 오늘은 추천 없음 ☕ "
              "(억지 추천 대신 쉬어가기)")
        save_skip(today, top, min_score)
        return

    print(f"\n[선정] 오늘의 논문: {winner['title']} (점수 {top} ≥ 기준선 {min_score})")

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
        "track": track,
        "paper": {k: winner[k] for k in ("title", "authors", "published", "url", "arxiv_id")},
        "tag": winner["analysis"]["tag"],
        "scores": winner["analysis"]["scores"],
        "final_score": winner["analysis"]["final_score"],
        "based_on": based_on,
        "deep": deep,
    }
    save_and_report(record)

    # ── 추천된 논문을 풀에서 제거 → 추천완료 DB(output)로 '옮겨감' ──
    pool.pop(winner["arxiv_id"], None)
    poolmod.save_pool(pool)
    print(f"[풀] 추천작을 후보 풀에서 제거 (남은 후보 {len(pool)}편)")


def save_skip(date, top_score, min_score):
    """품질 기준선 미달인 날 — '추천 없음' 기록을 남겨 사이트가 쉬어가는 날을 표시하게 한다."""
    out_dir = os.path.join(HERE, "output")
    os.makedirs(out_dir, exist_ok=True)
    rec = {
        "date": date,
        "no_recommendation": True,
        "reason": "품질 기준선 미달",
        "top_score": top_score,
        "min_score": min_score,
    }
    with open(os.path.join(out_dir, f"{date}.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
    print(f"💾 '추천 없음' 기록 저장: {os.path.join(out_dir, date + '.json')}")


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
