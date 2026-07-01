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


# 일부 최신 모델(예: claude-opus-4-8)은 temperature 파라미터를 더 이상 받지 않는다
# ('temperature is deprecated for this model' 400 에러). 한 번 걸린 모델은 여기 기록해
# 두고, 이후로는 처음부터 temperature 없이 호출한다(매번 실패→재시도 낭비 방지).
_NO_TEMPERATURE = set()


def _ask_json(model, prompt, max_tokens=1500, temperature=0.4):
    """Claude를 호출하고 응답에서 JSON 객체를 파싱한다.
    temperature를 낮게 두면 날마다 문체가 덜 흔들려 일관성이 높아진다.
    단, temperature를 지원하지 않는 모델이면 자동으로 빼고 호출한다.
    """
    kwargs = dict(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    if temperature is not None and model not in _NO_TEMPERATURE:
        kwargs["temperature"] = temperature
    try:
        msg = client().messages.create(**kwargs)
    except anthropic.BadRequestError as e:
        # temperature 미지원 모델이면 그 파라미터만 빼고 1회 재시도(이후엔 기억)
        if "temperature" in str(e) and "temperature" in kwargs:
            _NO_TEMPERATURE.add(model)
            kwargs.pop("temperature")
            msg = client().messages.create(**kwargs)
        else:
            raise
    text = msg.content[0].text
    # ```json ... ``` 코드펜스나 잡텍스트가 섞여도 첫 JSON 블록을 추출
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"JSON을 찾지 못함:\n{text[:300]}")
    block = m.group(0)
    try:
        return json.loads(block)
    except json.JSONDecodeError:
        # 흔한 오류를 교정하고 1회 재시도:
        #  (1) 후행 콤마  (2) JSON에 없는 \' 이스케이프(모델이 작은따옴표를 \'로 씀)
        cleaned = re.sub(r",(\s*[}\]])", r"\1", block)
        cleaned = cleaned.replace("\\'", "'")
        return json.loads(cleaned)


# ---------- 선별: 관련성 게이트 + 6축 루브릭 ----------

def score_paper(cfg, paper):
    company = cfg["company"]
    downstream = company.get("downstream_markets", [])
    downstream_line = ("전방 시장(관찰 대상): " + ", ".join(downstream) + "\n") if downstream else ""
    prompt = f"""당신은 {company['name']}의 기술 전략 애널리스트입니다.
관점: {company['perspective']}
주력 사업: {", ".join(company['business_areas'])}
경쟁/고객: {", ".join(company['competitors'])}
{downstream_line}
아래 arXiv 논문을 평가하세요.

제목: {paper['title']}
초록: {paper['abstract']}
저자: {", ".join(paper['authors'][:8])}

먼저 이 논문이 우리에게 의미 있는지(is_relevant) 판단하세요. 다음 중 하나면 관련 있음(true)입니다:
 (a) 반도체(메모리/패키징/소자/컴퓨팅 아키텍처)와 실질적으로 관련, 또는
 (b) AI 전방 시장의 변화·트렌드로서 메모리 수요·전략에 의미가 있는 것
     (예: 대형 모델 규모·효율 변화, AI 인프라/추론 비용, 메모리·연산 수요를 바꾸는 기법).
순수 언어학·무관한 응용 등 메모리 사업과 연결고리가 없으면 is_relevant=false 입니다.

관련 있다면 아래 6개 축을 각 0~5점으로 채점하세요:
- business: 우리 주력 사업(HBM/DRAM/NAND/CXL/PIM/패키징)과의 직접 연관성
- threat: 기존 메모리를 대체할 신기술이거나 경쟁사 움직임인가 (위기 신호)
- demand: AI 등 전방 시장이 메모리 수요를 견인하는 신호인가 (기회 신호)
- maturity: 상용화/도입 임박도 (기초연구 0 ~ 양산·실전 근접 5)
- credibility: 저자/기관 신뢰도 (주요 기업·핵심 대학·선도 AI랩일수록 높음)
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

# 어려운 용어를 만났을 때 '개념을 쌓아 올리는' 시범. 밀도 높은 AI 논문에서
# 모델이 용어를 그냥 던지고 지나가는 것을 막기 위한 대조 예시(bad vs good).
CONCEPT_BUILDING_DEMO = """[개념 쌓기 시범 — 어려운 용어가 나올 때 이렇게 풀어 쓰세요]
✗ 나쁜 예 (용어를 설명 없이 던짐 — 절대 금지):
"후반부 레이어에서 시각 토큰의 값은 크게 변하지만, 그 변화가 최종 답변에는 거의 영향을 주지 않는 반직관적 사실을 발견했습니다."
→ '레이어'·'토큰'·'값이 변한다'가 뭔지 모르면 한 글자도 이해 못 합니다. '반직관적'이라는데 무슨 통념이 뒤집혔는지도 알 수 없어요.

✓ 좋은 예 (개념을 먼저 쌓고, 통념을 깔고, 그 위에서 반전):
"AI가 그림을 이해하려면 먼저 그림을 잘게 쪼갠 조각들로 바꿉니다. 이 조각 하나하나를 '시각 토큰'이라고 불러요. 그리고 AI는 이 조각들을 여러 처리 단계('레이어')에 차례로 통과시키며 조금씩 다듬어 갑니다. 상식적으로는, 뒷단계까지 열심히 다듬을수록 최종 답이 더 정교해질 거라 기대하겠죠. 그런데 연구진이 안을 들여다보니, 뒷단계에서 조각들을 계속 바꾸고 있는데도 정작 최종 답은 거의 달라지지 않았습니다. 열심히 계산하지만 결과에는 보탬이 안 되는 '헛일'을 하고 있던 셈이죠."
→ 토큰→레이어→통념→반전 순으로 쌓아, 처음 보는 사람도 마지막 문장까지 따라옵니다. 이 흐름을 모든 어려운 대목에 적용하세요.
"""

# 매일 같은 톤·구조가 나오도록 모델에 보여주는 '모범답안(few-shot)'.
# 실제로 호평받은 출력을 그대로 박아, 날마다 이 문체를 재현하게 한다.
STYLE_EXAMPLE = """[좋은 출력 예시 — 이 깊이·분량·구조를 그대로 따르세요. 각 body는 3~5문장으로 충분히 풀어 씁니다. 특히 implication_sections는 ①직접 의미 ②균형(반론·한계) ③전략 시사점 3단으로 가장 깊게 씁니다.]
{
  "summary_sections": [
    {"heading": "Google이 직접 만든 AI 전용 칩, TPU의 8년사",
     "body": "TPU는 Google이 오직 AI 계산만을 위해 만든 전용 칩입니다. 2016년 처음 공개됐을 때 같은 시기 GPU보다 전력 대비 성능이 30배나 높아 업계에 큰 충격을 줬어요. 소프트웨어 회사가 직접 칩을 설계했다는 점도 이례적이었습니다. 이 논문은 그중 'AI 학습'을 담당하는 2세대(2017년)부터 최신 7세대 Ironwood(2025년)까지 8년의 발전 과정을 한 편으로 정리한 보고서입니다."},
    {"heading": "비결은 '설계는 그대로 두고, 부품을 키우기'",
     "body": "보통 새 칩은 설계를 뜯어고치지만, TPU는 처음의 기본 틀을 거의 바꾸지 않고 핵심 부품을 더 크게·더 많이 넣는 방식으로 성능을 끌어올렸습니다. 그 결과 8년 만에 칩 하나의 성능은 약 100배, 메모리(HBM)는 약 10배, 슈퍼컴퓨터 전체 성능은 3600배가 됐어요. '무어의 법칙이 끝나간다'는 시대에 이뤄낸 성과라 더 주목받습니다. 설계를 유지한 덕분에 예전 칩에 맞춰 짠 소프트웨어를 새 칩에서도 그대로 쓸 수 있다는 이점도 컸습니다."},
    {"heading": "성능만이 아니라 '고장 견디기'와 '전기'까지",
     "body": "수천~수만 개 칩을 묶으면 일부는 반드시 고장 납니다. Google은 광회로 스위치로 고장 난 칩을 우회하고, 계산 결과만 슬며시 틀리는 '조용한 오류'를 잡는 장치도 새로 넣었어요. 또 데이터센터 전력이 부족한 시대라 '전력 대비 성능'이 최우선 지표가 됐고, 논문은 탄소배출까지 함께 따지는 새 지표(CCI)를 제안합니다."}
  ],
  "key_terms": [
    {"term": "HBM (고대역폭 메모리)", "explain": "D램을 위로 쌓아 데이터를 한꺼번에 빠르게 주고받게 만든 고성능 메모리입니다. AI 칩의 속도를 좌우하는 핵심 부품이자 SK하이닉스의 주력 제품입니다."},
    {"term": "TPU (텐서 처리 장치)", "explain": "Google이 AI 계산만을 위해 만든 전용 칩입니다. 범용 칩보다 AI 작업을 훨씬 빠르고 전력 효율적으로 처리합니다."}
  ],
  "implication_sections": [
    {"heading": "HBM 수요는 '유행'이 아니라 '구조'입니다",
     "body": "TPU 성능 폭증의 핵심 동력 중 하나가 바로 HBM입니다. 세대를 거듭할수록 한 칩에 들어가는 HBM의 용량·속도가 커지고 쌓는 단수도 늘었어요. AI 칩이 발전할수록 더 많고 더 빠른 HBM이 '필수'가 된다는 뜻입니다. SK하이닉스 주력 제품의 수요가 잠깐의 유행이 아니라 구조적으로 우상향한다는 강력한 신호예요."},
    {"heading": "엔비디아 너머, 고객을 넓힐 기회",
     "body": "Google이 자체 칩을 만든다는 건, HBM이 엔비디아 GPU에만 실리는 게 아니라 빅테크 자체 칩에도 들어간다는 뜻입니다. 구글뿐 아니라 아마존·마이크로소프트도 자체 칩 대열에 있어요. SK하이닉스 입장에선 'HBM을 살 큰손'이 여러 곳으로 늘어나, 특정 고객 의존도를 낮추고 고객층을 넓힐 수 있습니다."},
    {"heading": "다음 경쟁 기준은 '저전력·저탄소 메모리'",
     "body": "다만 숙제도 던집니다. 전력이 부족한 시대라 '얼마나 적은 전력으로 성능을 내느냐'가 최우선이 됐고, 탄소배출까지 평가 잣대가 되고 있어요. 메모리도 용량·속도를 넘어 '저전력·저탄소' 경쟁력이 차별점이 될 것입니다. 이 흐름에 먼저 올라타면 위협이 아니라 기회가 됩니다."}
  ]
}
"""


def _validate_deep(d):
    """1차 '구조 점검'(값싸고 결정적). 깊이·인사이트는 _judge_quality가 따로 본다.
    여기서는 섹션이 빠지거나 한 줄짜리로 채워지는 명백한 결함만 거른다.
    (글자수 하한을 낮게 둬 '분량 채우기' 유인을 만들지 않는다 — 품질은 편집장이 판단)"""
    MIN_BODY = 90    # 한 줄짜리 블록만 차단(군더더기 유인 방지 위해 낮게)
    MIN_TERM = 25
    ss = d.get("summary_sections")
    isec = d.get("implication_sections")
    if not isinstance(ss, list) or len(ss) < 3:
        return False, "summary_sections가 3개 미만"
    if not isinstance(isec, list) or len(isec) < 3:
        return False, "implication_sections가 3개 미만(①직접 의미 ②균형 ③시사점 필요)"
    for sec in ss + isec:
        if len(sec.get("body") or "") < MIN_BODY:
            return False, f"본문이 한 줄짜리로 너무 짧음(소제목: {sec.get('heading')})"
    terms = d.get("key_terms") or []
    if len(terms) < 5:
        return False, "key_terms가 5개 미만"
    for t in terms:
        if len((t.get("explain") or "")) < MIN_TERM:
            return False, f"용어 설명이 너무 짧음(용어: {t.get('term')})"
    return True, ""


def _judge_quality(cfg, paper, deep):
    """'깐깐한 편집장' LLM이 초안의 인사이트 품질을 심사한다(길이가 아니라 내용).
    모든 축이 4점 이상이면 통과. 아니면 (False, 구체적 지적)을 돌려 재작성에 쓴다."""
    draft = json.dumps(deep, ensure_ascii=False, indent=2)
    prompt = f"""당신은 깐깐한 기술 뉴스레터 편집장입니다. 아래 초안을 냉정하게 평가하세요.
독자는 '경영학 전공에 기술 배경이 거의 없는 사람(고등학생도 읽는다고 가정)'입니다. 똑똑하지만 이 분야는 처음이라, 토큰·레이어·어텐션·캐시 같은 기본 용어를 모릅니다. 이 사람이 '읽다 보면 저절로 이해되는' 글이어야 합니다.

[원논문 초록 — 사실 대조용]
{paper.get('abstract','')}

[평가할 초안(JSON)]
{draft}

먼저 (출력하지 말고 속으로) 초안에서 '가장 어려운 문장 3개'를 골라, 각 문장에 '설명 없이 처음 등장한 전문용어'나 '통념 없이 튀어나온 반전'이 있는지 점검하세요. 그 점검을 바탕으로 아래 4개 축을 각 1~5점으로 채점하세요(5가 최고):
- clarity(가장 중요): 이 분야를 처음 본 사람이 앞 문장만 읽고도 각 문장을 이해할 수 있는가? 위에서 고른 어려운 문장 중 하나라도 '설명 없는 용어'나 '통념 없는 반전'을 담고 있으면 clarity는 2점 이하입니다. 괄호 한 단어 뜻풀이는 설명으로 치지 않습니다.
- specificity: 논문의 구체적 사실·수치·고유명사가 실제로 인용됐는가? 두루뭉술하면 1~2점.
- insight: SK하이닉스 시사점이 '비자명하고 실질적'인가? 누구나 할 법한 뻔한 일반론이면 1~2점.
- no_fluff: 분량을 채우려는 군더더기·동어반복·내용 없는 문장이 없는가? 있으면 1~2점.

아래 JSON으로만 답하세요(다른 텍스트·줄바꿈 없이 한 줄로, 큰따옴표 안에는 큰따옴표를 쓰지 말 것):
{{"scores":{{"clarity":N,"specificity":N,"insight":N,"no_fluff":N}}, "verdict":"pass 또는 revise", "critique":"어느 문장에서 어떤 용어가 설명 없이 튀어나왔는지(또는 어떤 반전이 통념 없이 나왔는지) 콕 집고, 그 개념을 앞에서 어떻게 쌓아 줘야 하는지 2~4문장. 일반론·군더더기도 함께 지적. pass면 빈 문자열."}}
판정 규칙: 네 축이 모두 4점 이상이면 verdict=pass, 하나라도 3점 이하이면 revise. 특히 clarity가 3점 이하이면 다른 점수와 무관하게 반드시 revise."""
    judge_model = cfg["models"].get("judge") or cfg["models"]["deep"]
    try:
        # max_tokens는 넉넉히(critique가 길면 700에선 잘려 JSON이 안 닫힘 → 파싱 실패)
        r = _ask_json(judge_model, prompt, max_tokens=1500, temperature=0.2)
    except Exception as e:
        print(f"[심사] 편집장 호출 실패({e}) — 통과 처리")
        return True, ""
    scores = r.get("scores", {}) or {}
    ok = r.get("verdict") == "pass" and all((v or 0) >= 4 for v in scores.values())
    return ok, r.get("critique", "")


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

[가장 중요 — '이해 가능성' 규칙 (이걸 어기면 아무리 깊어도 실패한 글입니다)]
- 독자는 이 분야를 '처음' 접합니다. 토큰·레이어·어텐션·캐시 같은 기본 용어조차 모른다고 전제하고, 그 개념 자체를 먼저 풀어 준 뒤에 사용하세요.
- 모든 전문용어는 '처음 등장하는 그 자리에서' 쉬운 말로 한 문장 이상 설명한 뒤에 써야 합니다. 설명 없이 용어를 먼저 던지는 문장은 금지.
- 괄호 안 한 단어 뜻풀이(예: "어텐션(정보 배치)")로 때우지 마세요. 그건 설명이 아니라 또 다른 암호입니다. 무엇을·왜 하는지 한 문장으로 실제로 이해되게 푸세요.
- 어떤 주장을 하기 전에, 그 주장이 기대는 '선행 개념'을 반드시 먼저 쌓으세요. (예: "토큰 값이 변해도 답에 영향이 없다"를 말하려면, 그 전에 '토큰이 무엇이고, 그게 여러 단계를 거치며 다듬어진다'를 먼저 세워야 합니다.)
- '반직관적이다·놀랍게도·의외로' 같은 반전 표현을 쓰려면, 반드시 그 앞에 '보통은 이럴 거라 기대하죠'라는 통념을 먼저 깔아 주세요. 통념 없이 결론만 반전이라 부르면 독자는 무엇이 뒤집혔는지 모릅니다.
- 자가 점검: 각 문장을 쓴 뒤 "이 분야를 처음 본 사람이, 앞 문장들만 읽고 이 문장을 이해할 수 있는가?"를 물으세요. 아니라면 앞에 설명을 먼저 넣으세요.

[글쓰기 원칙 — 매우 중요]
- 비문학 교양서처럼 술술 읽히되, 읽고 나면 핵심 줄기와 세부 내용이 모두 이해되도록 '차근차근' 풀어 쓰세요.
- 쉬운 내용만 고르지 말고, 어려운 개념도 도망가지 말고 앞에서 한 걸음씩 쌓아 올려 자연스럽게 이해시키세요. (쉽게 = 개념을 빼는 게 아니라, 개념을 끝까지 풀어 주는 것)
- '소제목(heading) + 본문(body)' 구조로 쓰되, 각 body는 반드시 3~5문장으로 충분히 풀어 쓰세요. 한 줄 요약·압축 금지(깊이를 잃지 말 것).
- 전체는 아침에 3~5분 안에 읽히도록 군더더기는 빼되, 각 섹션의 '내용 깊이'는 절대 줄이지 마세요. (짧게 != 얕게)
- 추상적 표현은 피하고, 본문에 나온 구체적 수치·사실(배수, 용량, 연도, 실험 결과 등)을 반드시 근거로 인용하세요.
- 특히 implication_sections('SK하이닉스에게 무슨 의미?')는 이 레터의 핵심입니다. 가장 깊고 구체적으로, ①직접적 의미 ②균형 잡힌 시각(반론·한계·불확실성) ③전략적 시사점의 3단으로 쓰세요. (단, 여기서도 용어를 던지지 말고 풀어서.)

{CONCEPT_BUILDING_DEMO}

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
    {{"heading": "소제목", "body": "이 논문이 무엇을 했고 왜 중요한지 본문 근거로 풀어쓴 3~5문장(약 200자 이상)"}}
  ],
  "key_terms": [{{"term": "전문용어", "explain": "두 문장으로 맥락까지 담은 쉬운 설명"}}],
  "implication_sections": [
    {{"heading": "소제목", "body": "{company['name']}에게 무슨 의미인지 본문 근거로 풀어쓴 3~5문장(약 200자 이상)"}}
  ],
  "background_papers": [
    {{"title": "함께 보면 좋은 배경 논문 제목", "why": "왜 먼저/같이 보면 좋은지 한 문장"}}
  ],
  "reading_order": "어떤 순서로 공부하면 좋을지 한 문장"
}}
[분량·개수 규칙 — 반드시 준수]
- summary_sections: 정확히 3개. 각 body 3~5문장(약 200자 이상).
- implication_sections: 정확히 3개(①직접 의미 ②균형 잡힌 시각 ③전략 시사점). 각 body 3~5문장(약 200자 이상). 이 레터에서 가장 깊어야 하는 부분.
- key_terms: 5~6개. 각 explain은 두 문장으로 맥락까지.
- background_papers: 참고문헌 후보(없으면 본문 인용)에서 1~2개, survey/review 우선."""

    model = cfg["models"]["deep"]
    # 생성 → ①구조 점검(값싼 결정적) ②편집장 인사이트 심사(LLM) → 미달이면
    # 구체적 지적으로 최대 3회 재생성. '길이'가 아니라 '내용'으로 품질을 강제한다.
    result = _ask_json(model, prompt, max_tokens=6000, temperature=0.3)
    for attempt in range(3):
        ok_s, reason = _validate_deep(result)            # ① 구조
        if ok_s:
            ok_q, critique = _judge_quality(cfg, paper, result)   # ② 인사이트
            if ok_q:
                break
            reason = "인사이트·구체성 부족 → " + (critique or "더 구체적이고 비자명하게")
        print(f"[통역] 품질 미달({reason}) — 재생성 {attempt + 1}/3")
        retry_prompt = prompt + (
            f"\n\n[재작성 지시] 편집장 지적: {reason}\n"
            "분량을 채우려 군더더기를 넣지 말고, 지적된 부분을 '논문의 구체적 사실·수치'와 "
            "'비자명한 SK하이닉스 시사점'으로 더 날카롭게 다시 쓰세요. 요약 3·무슨의미 3·용어 5~6 구조는 유지.")
        result = _ask_json(model, retry_prompt, max_tokens=6000, temperature=0.35)
    return result
