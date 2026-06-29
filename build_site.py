"""
정적 사이트 빌드 — output/*.json(매일 배치 결과)을 site/data.js로 모은다.
브라우저는 이 data.js만 읽으므로 API 키가 전혀 필요 없다(정적 사이트).
매일 배치(main.py) 후 이 스크립트를 한 번 돌리면 사이트가 갱신된다.
"""
import os
import re
import json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "output")
SITE_DIR = os.path.join(HERE, "site")

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}\.json$")


def build():
    data = {}
    if os.path.isdir(OUT_DIR):
        for fn in sorted(os.listdir(OUT_DIR)):
            if DATE_RE.match(fn):
                rec = json.load(open(os.path.join(OUT_DIR, fn), encoding="utf-8"))
                data[rec["date"]] = rec

    os.makedirs(SITE_DIR, exist_ok=True)
    js = "window.RADAR_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    with open(os.path.join(SITE_DIR, "data.js"), "w", encoding="utf-8") as f:
        f.write(js)
    print(f"[build] {len(data)}일치 데이터 → site/data.js 생성 완료")
    if data:
        print("[build] 날짜:", ", ".join(sorted(data)))


if __name__ == "__main__":
    build()
