"""
30일 후보 풀 DB — 점수를 캐싱해 '신규 논문만 채점'(증분 채점)하게 한다.

- pool.json: 아직 추천되지 않은 후보들 { arxiv_id: {..paper.., analysis, first_seen} }
- 추천된 논문은 풀에서 빠져 output/(추천완료 DB = 아카이브)로 '옮겨간다'.
- 매일: 신규 논문만 채점해 풀에 추가 + 30일 지난 미추천 논문은 풀에서 제거.
"""
import os
import json
import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
POOL_PATH = os.path.join(HERE, "pool.json")


def load_pool():
    if os.path.exists(POOL_PATH):
        try:
            return json.load(open(POOL_PATH, encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_pool(pool):
    with open(POOL_PATH, "w", encoding="utf-8") as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)


def prune_old(pool, lookback_days):
    """제출일이 lookback_days를 벗어난(오래된) 미추천 논문을 풀에서 제거. 제거 수 반환."""
    cutoff = (datetime.date.today() - datetime.timedelta(days=lookback_days)).isoformat()
    old = [aid for aid, p in pool.items() if (p.get("published") or "") < cutoff]
    for aid in old:
        del pool[aid]
    return len(old)
