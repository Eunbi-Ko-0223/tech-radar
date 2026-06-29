# 반도체 기술 레이더 — 핵심 로직 프로토타입

매일 arXiv에서 반도체 신기술 논문을 수집해, SK하이닉스 실무자 관점에서
**오늘의 한 편**을 골라 쉬운 언어로 통역해주는 에이전트의 핵심 로직입니다.

## 파이프라인

```
fetch.py    1단계 수집(그물)   — arXiv에서 반도체 후보 논문을 넓게 긁어옴
analyze.py  2단계 선별(체)+통역 — LLM이 읽고 거르고, 6축 루브릭 점수화, 깊은 통역
learning.py 학습 패키지        — Semantic Scholar 인용그래프로 배경 논문 추천
main.py     오케스트레이션     — best pick 1편 선정 → output/날짜.json 저장 + 리포트
```

## 설치

```powershell
pip install -r requirements.txt
```
(이미 anthropic / arxiv / requests 가 깔려 있으면 생략 가능)

## 실행

**1) API 키 없이 수집만 확인 (그물망 동작 테스트)**
```powershell
python main.py --dry-run
```

**2) 전체 파이프라인 (LLM 통역까지)** — Anthropic API 키 필요
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."   # PowerShell
python main.py
```

> API 키는 https://console.anthropic.com 에서 발급합니다.
> 매번 입력하기 번거로우면 시스템 환경변수로 등록해두세요.

## 결과물

- 콘솔: 읽기 좋은 "오늘의 논문" 리포트
- `output/YYYY-MM-DD.json`: 날짜별 저장 (→ 향후 웹사이트 달력/리스트 아카이브의 원천 데이터)

## 설정 교체 (계열사 확장 대비)

`config.json`만 바꾸면 추적 키워드·회사 관점·사업영역이 통째로 교체됩니다.
공통 엔진(코드)은 건드리지 않고 다른 SK 계열사에 재사용할 수 있습니다.
