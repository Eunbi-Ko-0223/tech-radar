window.RADAR_DATA = {
  "2026-06-29": {
    "date": "2026-06-29",
    "paper": {
      "title": "Google's Training Supercomputers from TPU v2 to Ironwood: Architectural Stability, Scale, Resilience, Power Efficiency, and Sustainability Across Five Generations",
      "authors": [
        "Norman P. Jouppi",
        "Sridhar Lakshmanamurthy",
        "Cliff Young",
        "David Patterson"
      ],
      "published": "2026-06-14",
      "url": "http://arxiv.org/abs/2606.15870v1",
      "arxiv_id": "2606.15870"
    },
    "tag": "기회",
    "scores": {
      "business": 4,
      "threat": 2,
      "demand": 5,
      "maturity": 5,
      "credibility": 5,
      "novelty": 3
    },
    "final_score": 5.1,
    "deep": {
      "easy_summary": "이 논문은 구글이 8년에 걸쳐 만든 AI 학습용 전용 컴퓨터 칩(TPU)의 5세대 발전사를 정리한 것입니다. 첫 버전(TPU v2)부터 최신 버전(Ironwood)까지, 기본 설계 틀은 거의 바꾸지 않으면서도 챗GPT 같은 새로운 AI 기술(트랜스포머)까지 잘 처리할 수 있도록 진화한 과정을 설명합니다. 8년 동안 메모리 용량과 속도는 10배, 칩 한 개 성능은 100배, 전체 슈퍼컴퓨터 성능은 3600배 늘었다고 밝힙니다. 또한 고장에 잘 견디는 기술, 전력 효율과 탄소 배출 개선 같은 친환경 성과를 다루고, 앞으로 성공할 AI 학습용 칩의 6가지 특징을 제시합니다.",
      "key_terms": [
        {
          "term": "TPU (Tensor Processing Unit)",
          "explain": "구글이 AI 계산만을 위해 특별히 만든 전용 칩으로, 범용 컴퓨터 칩보다 AI 작업을 훨씬 빠르고 효율적으로 처리합니다."
        },
        {
          "term": "HBM (고대역폭 메모리)",
          "explain": "여러 개의 메모리 칩을 위로 쌓아 데이터를 매우 빠르게 주고받게 만든 고성능 메모리로, AI 칩의 속도를 좌우하는 핵심 부품입니다."
        },
        {
          "term": "트랜스포머(Transformer)",
          "explain": "챗GPT 같은 최신 AI의 기반이 되는 기술 구조로, 문장이나 데이터의 맥락을 잘 이해하게 해줍니다."
        },
        {
          "term": "광 회로 스위치(Optical Circuit Switch)",
          "explain": "빛(광신호)을 이용해 수많은 칩들을 빠르고 유연하게 연결해주는 장치로, 일부가 고장 나도 연결을 다시 짜서 계속 작동하게 합니다."
        },
        {
          "term": "와트당 성능(Performance per Watt)",
          "explain": "전기 1와트를 쓸 때 얼마나 많은 계산을 하는지를 나타내는 효율 지표로, 높을수록 전기를 적게 쓰면서 일을 많이 합니다."
        },
        {
          "term": "회복탄력성(Resilience)",
          "explain": "수만 개 칩 중 일부가 고장 나도 전체 시스템이 멈추지 않고 학습을 계속 이어가는 능력입니다."
        },
        {
          "term": "내장 자가 진단(Built-in Self Test)",
          "explain": "칩 스스로 자신의 고장 여부를 점검하는 기능으로, 문제를 빨리 찾아내 대형 시스템의 안정성을 높입니다."
        }
      ],
      "why_matters": "이 논문은 SK하이닉스에게 분명한 기회 신호입니다. TPU 성능이 8년간 폭발적으로 커진 핵심 원동력이 바로 HBM 용량과 대역폭의 10배 증가인데, 이는 곧 AI 칩 시대에 고성능 메모리 수요가 계속 폭증한다는 것을 의미하기 때문입니다. 구글 같은 빅테크가 자체 AI 칩을 만들수록 SK하이닉스의 HBM 같은 첨단 메모리가 더 많이 필요해지므로, 엔비디아 외 고객 다변화의 가능성도 커집니다. 다만 전력 효율과 탄소 배출이 핵심 평가 기준이 되고 있어, 메모리 역시 단순 성능을 넘어 '저전력·친환경' 경쟁력을 갖춰야 한다는 과제도 함께 던져줍니다.",
      "background_papers": [],
      "reading_order": "참고문헌 정보가 제공되지 않았으므로, 먼저 'HBM이 무엇이고 왜 AI 칩에 중요한지'를 다룬 SK하이닉스 내부 기초 자료나 메모리 입문 자료로 개념을 잡은 뒤 이 논문을 읽으면 TPU 발전과 메모리 수요의 연결고리를 가장 쉽게 이해할 수 있습니다."
    }
  }
};
