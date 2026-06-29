"""
2단계 (정밀도 우선) — LLM이 후보 논문을 읽고 거르고(체), 점수 매기고, 통역한다.
 - score_paper(): 관련성 게이트 + 6축 루브릭 점수 + 기회/위협 태그 (경량, scoring 모델)
 - deep_analyze(): 선정된 1편을 비전공자용으로 깊게 통역 (deep 모델)
"""
import json
import re
import anthropic

_client = None


def client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 환경변수 사용
    return _client


def _ask_json(model, prompt, max_tokens=1500, temperature=0.4):
    """Claude를 호출하고 응답에서 JSON 객체를 파싱한다.
    temperature를 낮게 두면 날마다 문체가 덜 흔들려 일관성이 높아진다.
    """
    msg = client().messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text
    # ```json ... ``` 코드펜스나 잡텍스트가 섞여도 첫 JSON 블록을 추출
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"JSON을 찾지 못함:\n{text[:300]}")
    return json.loads(m.group(0))


# ---------- 선별: 관련성 게이트 + 6축 루브릭 ----------

def score_paper(cfg, paper):
    company = cfg["company"]
    prompt = f"""당신은 {company['name']}의 기술 전략 애널리스트입니다.
관점: {company['perspective']}
주력 사업: {", ".join(company['business_areas'])}
경쟁/고객: {", ".join(company['competitors'])}

아래 arXiv 논문을 평가하세요.

제목: {paper['title']}
초록: {paper['abstract']}
저자: {", ".join(paper['authors'][:8])}

먼저 이 논문이 반도체(특히 메모리/패키징/소자/컴퓨팅 아키텍처)와 실질적으로 관련 있는지 판단하세요.
머신러닝의 'memory network', 모델 'scaling' 같은 무관한 논문이면 is_relevant=false 입니다.

관련 있다면 아래 6개 축을 각 0~5점으로 채점하세요:
- business: 우리 주력 사업(HBM/DRAM/NAND/CXL/PIM/패키징)과의 직접 연관성
- threat: 기존 메모리를 대체할 신기술이거나 경쟁사 움직임인가 (위기 신호)
- demand: AI 가속기·데이터센터 등 메모리 수요를 견인하는 응용인가 (기회 신호)
- maturity: 상용화 임박도 (기초연구 0 ~ 양산 근접 5)
- credibility: 저자/기관 신뢰도 (주요 기업·핵심 대학일수록 높음)
- novelty: 새로운 패러다임·화제성

반드시 아래 JSON 형식으로만 답하세요:
{{
  "is_relevant": true/false,
  "relevance_reason": "한 문장",
  "scores": {{"business":0,"threat":0,"demand":0,"maturity":0,"credibility":0,"novelty":0}},
  "tag": "기회" 또는 "위협" 또는 "중립",
  "one_line": "이 논문이 왜 중요한지(혹은 안 중요한지) 한 문장"
}}"""
    result = _ask_json(cfg["models"]["scoring"], prompt, max_tokens=600)
    result["final_score"] = compute_score(cfg, result)
    return result


def compute_score(cfg, result):
    """루브릭 가중합 + 위협/수요 신호 가산점 → 최종 점수."""
    if not result.get("is_relevant"):
        return -1.0
    r = cfg["rubric"]
    w = dict(r["weights"])
    if r.get("trendy_mode"):  # 트렌디 모드: 신규성 가중 상향
        w["novelty"] += r.get("trendy_extra_novelty_weight", 0)

    s = result["scores"]
    score = sum(s.get(k, 0) * wt for k, wt in w.items())

    # 위협/수요 신호가 강하면 자동 상위로 끌어올림
    sb = r["signal_boost"]
    if max(s.get("threat", 0), s.get("demand", 0)) >= sb["threshold"]:
        score += sb["bonus"]
    return round(score, 3)


# ---------- 통역(v2): 선정된 1편을 본문 기반으로 깊게 분석 ----------

# 매일 같은 톤·구조가 나오도록 모델에 보여주는 '모범답안(few-shot)'.
# 실제로 호평받은 출력을 그대로 박아, 날마다 이 문체를 재현하게 한다.
STYLE_EXAMPLE = """[좋은 출력 예시 — 이 톤과 구조, 분량을 그대로 따르세요]
{
  "summary_sections": [
    {"heading": "Google이 직접 만든 AI 전용 칩, TPU의 8년사",
     "body": "TPU는 Google이 오직 AI 계산만을 위해 만든 전용 칩입니다. 2016년 처음 공개됐을 때 같은 시기 GPU보다 전력 대비 성능이 30배나 높아 큰 충격을 줬습니다. 이 논문은 2세대(2017년)부터 최신 7세대(2025년)까지 8년의 발전 과정을 정리한 보고서입니다."},
    {"heading": "비결은 '설계는 그대로 두고, 부품을 키우기'",
     "body": "보통 새 칩은 설계를 뜯어고치지만, TPU는 기본 틀을 거의 바꾸지 않고 핵심 부품을 더 크게·많이 넣어 성능을 끌어올렸습니다. 그 결과 8년 만에 칩 성능 100배, 메모리 10배, 슈퍼컴퓨터 전체 3600배가 됐습니다."}
  ],
  "implication_sections": [
    {"heading": "HBM 수요는 '유행'이 아니라 '구조'입니다",
     "body": "TPU 성능 폭증의 핵심 동력이 HBM입니다. 세대를 거듭할수록 더 많고 빠른 HBM이 필수가 되므로, SK하이닉스 주력 제품의 수요가 구조적으로 우상향한다는 강력한 신호입니다."}
  ],
  "key_terms": [
    {"term": "HBM (고대역폭 메모리)", "explain": "D램을 위로 쌓아 데이터를 빠르게 주고받게 만든 고성능 메모리로, AI 칩 속도를 좌우하는 SK하이닉스 주력 제품입니다."}
  ]
}
"""


def _validate_deep(d):
    """v2 출력이 기준(소제목 개수·분량)을 만족하는지 검사. (ok, 이유) 반환."""
    ss = d.get("summary_sections")
    isec = d.get("implication_sections")
    if not isinstance(ss, list) or len(ss) < 2:
        return False, "summary_sections가 2개 미만"
    if not isinstance(isec, list) or len(isec) < 2:
        return False, "implication_sections가 2개 미만"
    for sec in ss + isec:
        body = (sec.get("body") or "")
        if len(body) < 60:
            return False, f"본문이 너무 짧음(소제목: {sec.get('heading')})"
    if len(d.get("key_terms") or []) < 4:
        return False, "key_terms가 4개 미만"
    return True, ""


def deep_analyze(cfg, paper, references, full_text=""):
    """선정된 best pick을 본문 기반으로 통역하고 학습 패키지를 구성한다(v2).
    - 초록이 아니라 논문 본문(full_text)까지 활용해 깊이를 확보한다.
    - 줄글 대신 '소제목 + 본문' 구조로, 비문학 책처럼 술술 읽히되 차근차근 이해되게.
    - few-shot 예시 + 낮은 temperature + 검증/재시도로 매일 일관된 품질을 보장한다.
    references: Semantic Scholar 참고문헌 [{title, is_survey}] 리스트(없을 수 있음)
    """
    company = cfg["company"]
    ref_lines = "\n".join(
        f"- {r['title']}" + ("  [survey/review]" if r.get("is_survey") else "")
        for r in references[:20]
    ) or "(참고문헌 정보 없음 — 본문에서 인용된 핵심 선행연구를 추론해 추천)"

    body = full_text.strip() or "(본문 미확보 — 초록만으로 작성)"

    prompt = f"""당신은 {company['name']}의 기술 전략 애널리스트이자, 비전공자를 위한 친절한 기술 통역사입니다.
독자는 경영학 전공의 실무자로 기술 배경지식이 거의 없지만, 똑똑하고 핵심을 알고 싶어합니다.

[글쓰기 원칙 — 매우 중요]
- 비문학 교양서처럼 술술 읽히되, 읽고 나면 핵심 줄기와 세부 내용이 모두 이해되도록 '차근차근' 풀어 쓰세요.
- 쓸데없는 비유로 도망가지 말고, 어려운 개념도 앞에서 한 걸음씩 설명해 자연스럽게 이해시키세요.
- 각 항목은 줄글 하나로 길게 쓰지 말고 '소제목(heading) + 짧은 본문(body)' 2~3개로 구조화하세요.
- 분량은 아침 뉴스레터처럼 가볍게. 전체를 3~5분 안에 읽을 수 있어야 합니다. 존댓말.
- 추상적 표현은 피하고, 본문에 나온 구체적 수치·사실(예: 배수, 용량, 연도)을 근거로 쓰세요.

{STYLE_EXAMPLE}

[분석 대상]
제목: {paper['title']}
초록: {paper['abstract']}

[논문 본문(앞부분)]
{body}

[참고문헌 후보(학습 패키지용)]
{ref_lines}

아래 JSON 형식으로만 답하세요(모든 설명은 쉬운 한국어):
{{
  "summary_sections": [
    {{"heading": "소제목", "body": "이 논문이 무엇을 했고 왜 중요한지 본문 근거로 풀어쓴 3~5문장"}}
  ],
  "key_terms": [{{"term": "전문용어", "explain": "한두 문장 쉬운 설명"}}],
  "implication_sections": [
    {{"heading": "소제목", "body": "{company['name']}에게 기회/위협인지, 사업적으로 무슨 의미인지 본문 근거로 풀어쓴 3~5문장"}}
  ],
  "background_papers": [
    {{"title": "함께 보면 좋은 배경 논문 제목", "why": "왜 먼저/같이 보면 좋은지 한 문장"}}
  ],
  "reading_order": "어떤 순서로 공부하면 좋을지 한 문장"
}}
- summary_sections, implication_sections는 각각 2~3개 항목으로.
- key_terms는 본문에 나온 핵심 용어 4~6개.
- background_papers는 참고문헌 후보(없으면 본문 인용)에서 1~2개, survey/review 우선."""

    model = cfg["models"]["deep"]
    # 1차 생성 → 검증. 기준 미달이면 이유를 알려주고 1회 재시도(일관성 보장).
    result = _ask_json(model, prompt, max_tokens=3000, temperature=0.3)
    ok, reason = _validate_deep(result)
    if not ok:
        print(f"[통역] 품질 기준 미달({reason}) — 1회 재생성")
        retry_prompt = prompt + f"\n\n[재작성 지시] 직전 출력이 기준 미달이었습니다: {reason}. " \
            "소제목+본문 항목 수와 분량 기준을 반드시 지켜 다시 작성하세요."
        result2 = _ask_json(model, retry_prompt, max_tokens=3000, temperature=0.3)
        ok2, _ = _validate_deep(result2)
        if ok2:
            result = result2
    return result
