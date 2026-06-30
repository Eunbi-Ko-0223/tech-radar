window.RADAR_DATA = {
  "2026-06-22": {
    "date": "2026-06-22",
    "track": "AI",
    "paper": {
      "title": "Forget Without Compromise: Nexus Sampling for Streaming KV-Cache Eviction Under Fixed Budgets",
      "authors": [
        "Duc Duong",
        "Hoang Anh Duy Le",
        "Jianwen Xie",
        "Anshumali Shrivastava",
        "Zhaozhuo Xu"
      ],
      "published": "2026-06-22",
      "url": "http://arxiv.org/abs/2606.23961v1",
      "arxiv_id": "2606.23961"
    },
    "tag": "기회",
    "scores": {
      "business": 3,
      "threat": 2,
      "demand": 5,
      "maturity": 3,
      "credibility": 3,
      "novelty": 4
    },
    "final_score": 4.5,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "LLM의 ‘단기 기억’ KV 캐시가 메모리 한계를 넘는다",
          "body": "LLM은 답을 만들어내는 동안 앞서 처리한 모든 토큰의 계산 결과를 ‘KV 캐시’에 쌓아둡니다. 문제는 이 캐시가 문맥 길이에 정비례해 커진다는 점이에요. 긴 문서를 다루거나(롱컨텍스트), 챗봇·코딩 에이전트처럼 작업이 끝없이 이어지면 캐시가 GPU 메모리 한도를 금세 넘깁니다. 그러면 추론 시스템은 매 순간 일부 토큰을 ‘영구히’ 버려야(eviction) 하죠."
        },
        {
          "heading": "기존 방식의 함정: ‘잠깐 덜 중요해 보인 토큰’을 영영 버린다",
          "body": "기존 방식은 매 순간 점수가 높은 K개만 딱 잘라 남기고 나머지는 버립니다(top-K). 그런데 어텐션 점수는 들쭉날쭉해서, 어떤 토큰은 지금은 한가해 보여도 몇 단계 뒤 다시 중요해질 수 있어요. 특히 여러 토큰을 이어주는 ‘다리(bridge) 토큰’은 늘 점수가 애매해 매번 잘려나갑니다. 한 번 버리면 되돌릴 수 없어, 사실은 중요했던 정보가 조용히 사라지죠(저자들은 이를 ‘점진적 침식’이라 부릅니다)."
        },
        {
          "heading": "해법: 확률적으로 남기고, 다리 토큰을 먼저 살린다",
          "body": "이 논문의 Nexus Sampling은 두 가지를 바꿉니다. ① 어텐션을 한 번 더 ‘이어 걸어’ 다리 토큰을 찾아내고(Nexus 점수), ② 딱 자르는 대신 점수에 비례한 확률로 남깁니다(리저버 샘플링). 추가 학습이 필요 없고, KV 캐시를 80%나 버려도 LongBench 성능이 원본 대비 약 1점 이내였으며, 한 문장당 캐시 메모리는 최대 10배 작아졌습니다."
        }
      ],
      "key_terms": [
        {
          "term": "KV 캐시",
          "explain": "LLM이 추론 중 앞선 토큰들의 계산 결과를 저장해 두는 메모리로, 문맥 길이에 정비례해 커지는 핵심 병목입니다."
        },
        {
          "term": "롱컨텍스트·에이전트",
          "explain": "입력이 매우 길거나(긴 문서·코드), AI가 여러 단계를 스스로 이어 수행하는 경우로, 둘 다 캐시를 폭증시킵니다."
        },
        {
          "term": "축출(eviction)",
          "explain": "메모리가 한도를 넘을 때 토큰을 영구히 버리는 동작입니다."
        },
        {
          "term": "top-K 선택",
          "explain": "매 순간 점수 상위 K개만 남기는 결정적 방식으로, 한 번 탈락하면 복구가 불가능합니다."
        },
        {
          "term": "다리(bridge) 토큰",
          "explain": "직접 점수는 낮지만 서로 연결된 토큰 무리를 이어주는 핵심 토큰으로, top-K가 잘 놓칩니다."
        },
        {
          "term": "리저버 샘플링",
          "explain": "점수에 비례한 확률로 토큰을 남겨, 가끔만 중요한 토큰도 장기적으로 살아남게 하는 통계 기법입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "메모리가 AI 추론의 ‘1차 천장’이라는 명확한 증거",
          "body": "이 논문 전체가 외치는 건 ‘GPU 메모리가 LLM 추론에서 가장 먼저 부딪히는 한계’라는 사실입니다. 롱컨텍스트·에이전트가 대세가 될수록 더 크고 더 빠른 메모리가 필수가 된다는 뜻이라, SK하이닉스 HBM 수요의 구조적 동력이 됩니다."
        },
        {
          "heading": "‘효율화 = 수요 감소’가 아니다",
          "body": "KV 캐시를 80% 줄이는 기법은 단기적으론 메모리 절약처럼 보일 수 있어요. 하지만 이런 효율화는 늘 ‘더 긴 문맥·더 큰 모델’을 가능하게 해 결국 총 메모리 수요를 키워왔습니다(제본스의 역설). 즉 ‘같은 메모리로 더 많이’가 ‘메모리를 덜 쓴다’로 이어지지 않습니다."
        }
      ],
      "background_papers": [
        {
          "title": "Attention Is All You Need (Vaswani et al., 2017)",
          "why": "KV 캐시가 왜 생기는지(어텐션 구조)부터 알아야 이 논문의 문제의식이 잡힙니다."
        },
        {
          "title": "H2O·StreamingLLM 등 KV 캐시 축출 대표 연구",
          "why": "이 논문이 비판하는 ‘top-K 축출’ 계열을 먼저 보면 개선점이 또렷해집니다."
        }
      ],
      "reading_order": "어텐션·KV 캐시 기초 → 기존 KV 축출(top-K) 연구 → 본 논문 순으로 보면 ‘왜 확률적으로 남겨야 하는지’가 자연스럽게 이해됩니다."
    }
  },
  "2026-06-23": {
    "date": "2026-06-23",
    "track": "반도체",
    "paper": {
      "title": "ColumnKeeper: Efficient Solutions to the ColumnDisturb Vulnerability in DRAM-based Systems",
      "authors": [
        "Andreas Kosmas Kakolyris",
        "F. Nisa Bostanci",
        "Ataberk Olgun",
        "Ismail Emir Yuksel",
        "Harsh Songara",
        "Konstantinos Marios Sgouras",
        "Umut Baser",
        "Konstantinos Kanellopoulos",
        "A. Giray Yaglikci",
        "Onur Mutlu"
      ],
      "published": "2026-06-21",
      "url": "http://arxiv.org/abs/2606.22632v2",
      "arxiv_id": "2606.22632"
    },
    "tag": "위협",
    "scores": {
      "business": 5,
      "threat": 4,
      "demand": 1,
      "maturity": 3,
      "credibility": 5,
      "novelty": 4
    },
    "final_score": 4.8,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "DRAM의 새 약점: ‘행’이 아니라 ‘열’이 흔들린다",
          "body": "DRAM은 데이터를 격자처럼 배열된 셀에 저장합니다. 그동안의 골칫거리는 특정 행을 반복 접근하면 이웃 행의 값이 뒤집히는 RowHammer였어요. 이 논문이 다루는 ColumnDisturb는 근본적으로 다릅니다 — 같은 ‘열(column)’을 반복 두드리면, 그 열의 비트라인을 공유하는 셀들이 한꺼번에 교란됩니다."
        },
        {
          "heading": "피해 규모가 차원이 다르다: 한 번에 수백만 셀",
          "body": "현대 DRAM은 이웃한 셀 묶음(서브어레이)끼리 비트라인을 공유하는 ‘오픈 비트라인’ 구조예요. 그래서 ColumnDisturb 한 번이 연속된 3개 서브어레이 전체, 즉 수천 개 행·수백만 개 셀에 영향을 줍니다. 몇 개 이웃 행만 건드리는 RowHammer와는 규모가 달라서, 기존 RowHammer 방어책으로는 막을 수 없습니다."
        },
        {
          "heading": "해법: 낮은 비용으로 막는 ColumnKeeper",
          "body": "저자들(Onur Mutlu 그룹, ETH 취리히)은 첫 대응책 ColumnKeeper를 제안합니다. 확정형(CK-D)은 서브어레이마다 짝·홀수 열 활성화를 카운터로 추적해 위험해지면 한 행을 새로고침하고, 확률형(CK-P)은 활성화 시 일정 확률로 인접 서브어레이를 새로고침합니다. 성능 저하는 0.15~0.36%로 매우 낮고(미래의 더 빡빡한 기준에서도 1.7~2.7%), 추가 면적도 0.03~0.1mm²에 불과합니다."
        }
      ],
      "key_terms": [
        {
          "term": "DRAM",
          "explain": "컴퓨터의 주기억장치로 쓰이는 휘발성 메모리로, SK하이닉스의 핵심 주력 제품입니다."
        },
        {
          "term": "메모리 격리(memory isolation)",
          "explain": "한 주소에 접근해도 다른 주소의 데이터는 안 바뀐다는 기본 전제로, 읽기 교란은 이 전제를 깨뜨립니다."
        },
        {
          "term": "RowHammer·RowPress",
          "explain": "특정 행을 반복 접근하거나 오래 열어둬 이웃 셀 값을 뒤집는 기존 교란 현상입니다."
        },
        {
          "term": "ColumnDisturb",
          "explain": "같은 열을 반복 두드려 비트라인을 공유하는 셀 전체를 교란하는, 이 논문이 다루는 새 현상입니다."
        },
        {
          "term": "오픈 비트라인 구조",
          "explain": "이웃 서브어레이끼리 비트라인을 공유하는 DRAM 설계로, 피해가 3개 서브어레이로 번지는 이유입니다."
        },
        {
          "term": "리프레시(refresh)",
          "explain": "셀 값을 다시 써 데이터를 보존하는 동작으로, 대응책의 핵심 수단입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "미세화의 그늘 — DRAM 제조사가 먼저 풀어야 할 숙제",
          "body": "읽기 교란은 DRAM을 더 촘촘히 만들수록 심해지는데(임계값은 낮아지고 비트플립은 늘어남), ColumnDisturb는 그 연장선에서 나온 더 큰 규모의 새 위협입니다. SK하이닉스 같은 제조사에겐 직접적인 신뢰성·보안 위협 신호이자, 양산 전에 칩 차원의 대응을 내재화해야 한다는 과제입니다."
        },
        {
          "heading": "위협이 곧 차별화 기회",
          "body": "다행히 이 논문은 0.1mm² 수준의 저비용 방어가 가능함을 보였어요. 이런 신종 결함을 먼저 이해하고 선제적으로 막는 제조사는 ‘신뢰성 높은 메모리’로 차별화할 수 있습니다. 특히 서버·AI·방산처럼 고신뢰가 필수인 시장에서 결함 대응력은 곧 제품 경쟁력입니다."
        }
      ],
      "background_papers": [
        {
          "title": "Flipping Bits in Memory Without Accessing Them (Kim et al., 2014) — RowHammer 원조",
          "why": "읽기 교란이 무엇이고 왜 위험한지(메모리 격리 붕괴)부터 잡아야 합니다."
        },
        {
          "title": "DRAM read disturbance 서베이 (Mutlu et al.)",
          "why": "RowHammer·RowPress·ColumnDisturb로 이어지는 교란 현상과 방어책 흐름을 조망합니다."
        }
      ],
      "reading_order": "RowHammer 기초 → 읽기 교란 서베이 → 본 논문(ColumnDisturb) 순으로 보면 새 위협의 규모와 대응이 또렷해집니다."
    }
  },
  "2026-06-24": {
    "date": "2026-06-24",
    "track": "AI",
    "paper": {
      "title": "SSM Adapters via Hankel Reduced-order Modeling: Injection Site Determines Task Suitability in Long-Context Fine-Tuning",
      "authors": [
        "Omanshu Thapliyal"
      ],
      "published": "2026-06-24",
      "url": "http://arxiv.org/abs/2606.26290v1",
      "arxiv_id": "2606.26290"
    },
    "tag": "중립",
    "scores": {
      "business": 2,
      "threat": 3,
      "demand": 2,
      "maturity": 2,
      "credibility": 3,
      "novelty": 4
    },
    "final_score": 2.7,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "거대 모델을 통째로 학습하지 않고 ‘작은 모듈’만 끼우는 시대",
          "body": "요즘은 거대 AI 모델을 처음부터 다시 학습하는 대신, 본체는 얼리고 작은 ‘어댑터’만 붙여 특정 작업에 맞추는 방식(PEFT)이 표준이에요. 그 대표가 LoRA로, 전체의 0.1~1%만 추가로 학습합니다."
        },
        {
          "heading": "LoRA의 한계: ‘과거를 기억’하지 못한다",
          "body": "이 논문은 LoRA의 근본적 약점을 짚습니다 — LoRA의 출력은 ‘현재 입력’만의 함수라, 앞선 단계들의 흐름(상태)을 누적하지 못해요. 예컨대 규칙에 따라 상태가 바뀌는 작업(간단한 상태기계나 패리티 계산)은 ‘지금까지의 이력’이 필요한데, LoRA는 구조적으로 이를 표현할 수 없습니다."
        },
        {
          "heading": "해법: 상태공간모델(SSM)을 어댑터로 — ‘기억’을 심는다",
          "body": "저자는 ‘기억(상태)’을 누적하는 상태공간모델(SSM)을 작은 어댑터로 끼워넣는 HRM을 제안합니다. 계산량은 LoRA와 같게 유지하면서, 긴 문맥 작업에서 LoRA를 크게 앞섰어요(예: 독해 QuALITY +34.8%, 요약 QMSum +71.6%). 즉 ‘트랜스포머가 못 가진 순차적 기억’을 작은 모듈로 보완할 수 있음을 보였습니다."
        }
      ],
      "key_terms": [
        {
          "term": "PEFT(파라미터 효율적 미세조정)",
          "explain": "거대 모델 본체는 얼리고 작은 모듈만 학습해 특정 작업에 맞추는 기법입니다."
        },
        {
          "term": "LoRA",
          "explain": "가장 널리 쓰이는 PEFT로 작은 두 행렬만 추가 학습합니다. 단, 현재 입력만 보고 과거 상태를 담지 못합니다."
        },
        {
          "term": "상태공간모델(SSM)",
          "explain": "긴 시퀀스를 ‘압축된 상태’로 계속 갱신하며 처리하는 구조(예: Mamba)로, 길이가 늘어도 메모리가 거의 안 커집니다."
        },
        {
          "term": "순차적 상태(sequential state)",
          "explain": "‘지금까지의 이력’을 누적한 정보로, 상태기계처럼 장기 의존이 필요한 작업에 필수입니다."
        },
        {
          "term": "HRM 어댑터",
          "explain": "이 논문이 제안한 SSM 기반 어댑터로, LoRA와 같은 계산량으로 긴 문맥 성능을 끌어올립니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "AI의 ‘메모리 사용 방식’이 갈라질 수 있다는 신호",
          "body": "트랜스포머는 문맥이 길수록 KV 캐시로 메모리를 많이 먹지만, SSM은 ‘압축된 상태’로 처리해 메모리 증가가 거의 없습니다. SSM 계열이 힘을 얻으면 AI의 메모리 요구(용량·대역폭) 패턴이 달라질 수 있어, SK하이닉스가 추적해야 할 ‘구조 변화’ 신호입니다."
        },
        {
          "heading": "당장의 위협보단, 길게 보는 관찰 포인트",
          "body": "다만 이 연구는 SSM으로 트랜스포머를 대체한 게 아니라 트랜스포머에 ‘기억 모듈’을 덧붙인 것이고, 아직 연구 단계예요. 현실의 대형 모델은 여전히 트랜스포머 중심이라 HBM 수요엔 당장 영향이 적습니다. 핵심은 ‘긴 문맥 수요 자체가 커진다’는 큰 흐름이고, 어떤 구조가 이기든 메모리 총량은 늘어납니다."
        }
      ],
      "background_papers": [
        {
          "title": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
          "why": "SSM이 무엇이고 왜 트랜스포머의 대안인지 핵심을 잡을 수 있습니다."
        },
        {
          "title": "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2022)",
          "why": "이 논문이 한계를 지적·비교하는 기준 기법이라 먼저 보면 기여가 또렷합니다."
        }
      ],
      "reading_order": "트랜스포머·KV 캐시 → LoRA(PEFT 기초) → Mamba(SSM 기초) → 본 논문 순으로 보면 ‘기억을 어떻게 심나’가 잘 이해됩니다."
    }
  },
  "2026-06-25": {
    "date": "2026-06-25",
    "track": "반도체",
    "paper": {
      "title": "2.5D Root of Trust: Securing the Chiplet Ecosystem",
      "authors": [
        "Charles Williams",
        "Mohammed Nabeel",
        "Gino Chacon",
        "Ozgur Sinanoglu",
        "Paul V. Gratz",
        "Johann Knechtel"
      ],
      "published": "2026-06-20",
      "url": "http://arxiv.org/abs/2606.22198v1",
      "arxiv_id": "2606.22198"
    },
    "tag": "기회",
    "scores": {
      "business": 4,
      "threat": 3,
      "demand": 4,
      "maturity": 2,
      "credibility": 4,
      "novelty": 4
    },
    "final_score": 4.7,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "칩 하나가 아니라 ‘여러 조각’을 붙이는 시대, 보안은 어떻게?",
          "body": "AMD, Apple, Intel, Nvidia 모두 이미 채택한 ‘칩렛(chiplet)’ 방식은 반도체를 하나의 큰 칩으로 만들지 않고 여러 작은 조각을 실리콘 인터포저(chiplet들을 연결하는 기판) 위에 붙여 완성합니다. 문제는 이 조각들이 서로 다른 회사, 심지어 신뢰할 수 없는 공급업체에서 만들어진다는 점입니다. 이 논문은 그 상황에서 어떤 공격이 가능한지, 어떻게 막을 수 있는지를 체계적으로 정리한 리뷰 논문입니다."
        },
        {
          "heading": "기존 보안 방식이 왜 안 통하는가",
          "body": "기존에는 ARM TrustZone이나 Intel SGX처럼 CPU 칩 안에 보안 기능을 심어두는 방식을 썼습니다. 그런데 칩렛 시스템에서는 그 CPU 칩 자체가 신뢰할 수 없는 공장에서 만들어질 수 있고, 칩들을 연결하는 통신망조차 악성 회로가 심어진 부품일 수 있습니다. 논문은 통신선 도청·위장 공격, 캐시 일관성을 악용한 위조 공격, 공유 통신망의 지연을 엿보는 부채널 공격 세 가지를 핵심 위협으로 제시합니다."
        }
      ],
      "key_terms": [
        {
          "term": "칩렛(Chiplet)",
          "explain": "하나의 큰 칩 대신 기능별로 나눠 만든 작은 반도체 조각으로, 여러 조각을 인터포저 위에 붙여 하나의 시스템을 완성합니다."
        },
        {
          "term": "인터포저(Interposer)",
          "explain": "여러 칩렛을 물리적으로 연결하는 실리콘 기판으로, 이 논문은 여기에 보안 로직을 심어 ‘신뢰의 뿌리’로 활용합니다."
        },
        {
          "term": "Root of Trust (신뢰의 뿌리)",
          "explain": "시스템 전체 보안의 출발점이 되는 신뢰할 수 있는 하드웨어 구성 요소입니다."
        },
        {
          "term": "하드웨어 트로이목마",
          "explain": "칩 제조 과정에서 악의적으로 심어두는 숨겨진 회로로, 특정 조건에서 데이터를 빼내거나 오작동시킵니다."
        },
        {
          "term": "캐시 일관성(Cache Coherence)",
          "explain": "여러 코어가 같은 메모리를 공유할 때 데이터가 항상 최신으로 일치하도록 맞춰주는 규칙으로, 이 자체가 공격 경로가 될 수 있습니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "HBM·인터포저 패키징이 ‘보안 인프라’로 격상되는 흐름",
          "body": "이 논문은 인터포저가 단순 배선 기판에서 시스템 보안의 핵심 허브로 진화하고 있음을 보여줍니다. SK하이닉스는 HBM을 인터포저 위에 올리는 2.5D 패키징을 이미 영위하고 있어, 보안 기능이 인터포저로 내려오면 ‘HBM+인터포저+보안’을 함께 책임지는 신뢰 공급망의 핵심 파트너로 포지셔닝할 수 있습니다."
        },
        {
          "heading": "성숙 공정 팹이 곧 경쟁력 — 공급망 차별화",
          "body": "논문은 능동형 인터포저를 65nm·90nm 같은 성숙 공정의 신뢰할 수 있는 공장에서 만드는 것이 현실적이라고 명시합니다. 첨단 공정이 아니어도 되는 만큼, 신뢰 공급망 인증을 선제 확보하면 방산·AI 데이터센터 등 보안 민감 고객에서 프리미엄 포지션을 차지할 수 있습니다."
        }
      ],
      "background_papers": [
        {
          "title": "A Survey on Hardware Security of 2.5D and 3D Integrated Circuits",
          "why": "2.5D/3D 반도체의 보안 위협 전반을 먼저 조망해야 이 논문의 위협 분류가 왜 필요한지 잡힙니다."
        },
        {
          "title": "Split Manufacturing for 2.5D ICs: Security Analysis and Defenses",
          "why": "이 논문이 설계 시점 방어의 출발점으로 삼는 ‘분할 제조’ 개념을 구체적으로 다룹니다."
        }
      ],
      "reading_order": "칩렛·인터포저 개념 → 하드웨어 보안 서베이 → 분할 제조 → 본 논문 순으로 보면 위협 배경부터 해법까지 자연스럽게 이해됩니다."
    }
  },
  "2026-06-26": {
    "date": "2026-06-26",
    "track": "AI",
    "paper": {
      "title": "KernelSight-LM: A Kernel-Level LLM Inference Simulator",
      "authors": [
        "Xiteng Yao",
        "Taeho Kim",
        "Hengzhi Pei",
        "Xinle Liu",
        "Kyle Ulrich",
        "Leonard Lausen",
        "Ashish Khetan",
        "Xiang Song",
        "George Karypis",
        "Martin Herbordt"
      ],
      "published": "2026-06-26",
      "url": "http://arxiv.org/abs/2606.28565v1",
      "arxiv_id": "2606.28565"
    },
    "tag": "기회",
    "scores": {
      "business": 2,
      "threat": 2,
      "demand": 4,
      "maturity": 3,
      "credibility": 4,
      "novelty": 3
    },
    "final_score": 4.0,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "LLM을 ‘실제로 서비스할 때’ 성능을 미리 가늠하기",
          "body": "LLM을 상용 서비스로 운영하면 추론 비용과 응답 속도가 사업성을 좌우합니다. 그런데 실제 성능은 서빙 정책과 GPU 내부 동작이 복잡하게 얽혀, 하드웨어·모델·설정을 바꿀 때마다 일일이 벤치마크해야 했어요 — 느리고 비싸고, 아직 안 산 하드웨어엔 시험해볼 수도 없었죠."
        },
        {
          "heading": "KernelSight-LM: 토큰·커널 단위로 쪼개 시뮬레이션",
          "body": "AWS·보스턴대 연구진이 만든 이 도구는 LLM 추론을 토큰 단위로 모의실행해 ‘GPU 커널별 지연시간’까지 분해합니다. 핵심은 ‘루프라인 모델’(연산 한계인지 메모리 대역폭 한계인지 구분)에 통신·부하 모델을 합친 거예요. 특히 측정 데이터 없이 사양만으로 처음 보는 GPU의 성능을 예측하는 모드는 오차 12.1%로, 단순 루프라인(22%)보다 1.8배 정확했습니다."
        },
        {
          "heading": "왜 유용한가: 하드웨어를 ‘사보기 전에’ 판단",
          "body": "이 도구로 어떤 GPU·설정이 비용·속도 목표에 맞는지 미리 비교할 수 있어, 용량 계획과 하드웨어 구매 결정에 쓰입니다. 또 ‘어느 커널이 병목인지’ 분해해줘서 하드웨어·소프트웨어를 함께 최적화(co-design)하는 데도 활용됩니다."
        }
      ],
      "key_terms": [
        {
          "term": "추론 서빙(inference serving)",
          "explain": "학습된 모델을 실제 사용자 요청에 응답시키는 운영 단계로, 비용·속도가 사업성을 좌우합니다."
        },
        {
          "term": "GPU 커널",
          "explain": "GPU에서 실제 계산을 수행하는 작은 프로그램 단위로, 추론 성능의 최소 구성요소입니다."
        },
        {
          "term": "루프라인(roofline) 모델",
          "explain": "성능이 ‘연산 능력’ 때문인지 ‘메모리 대역폭’ 때문인지 가려내는 분석 틀입니다."
        },
        {
          "term": "TTFT·TPOT",
          "explain": "첫 토큰까지 걸리는 시간과 토큰당 생성 시간으로, LLM 서비스 품질(지연)의 핵심 지표입니다."
        },
        {
          "term": "연속 배칭·프리픽스 캐싱",
          "explain": "여러 요청을 묶고 공통 입력을 재사용해 서빙 효율을 높이는 대표 기법들입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "추론 성능의 진짜 병목은 ‘메모리 대역폭’",
          "body": "이 도구가 루프라인으로 ‘연산 대 메모리 대역폭’을 굳이 나눠 본다는 건, LLM 추론에서 메모리 대역폭이 성능을 좌우하는 핵심 변수라는 방증입니다. 특히 토큰을 하나씩 생성하는 단계(TPOT)는 대표적인 메모리 대역폭 병목이라, HBM처럼 빠른 메모리가 곧 서비스 속도·비용 경쟁력입니다. SK하이닉스에 우호적 신호예요."
        },
        {
          "heading": "AI 서빙 시장 확대 = 메모리 수요 확대",
          "body": "LLM이 연구를 넘어 ‘대규모 운영’으로 가면서 추론 인프라와 하드웨어 구매가 커지고 있어요. 이런 ‘구매 전 성능 예측’ 도구가 등장했다는 것 자체가 시장이 그만큼 커졌다는 신호이고, 그 성장은 고성능 메모리 수요 확대로 이어집니다."
        }
      ],
      "background_papers": [
        {
          "title": "Efficient Memory Management for LLM Serving with PagedAttention (vLLM)",
          "why": "LLM 서빙에서 메모리(KV 캐시) 관리가 왜 성능 핵심인지 보여주는 대표 연구입니다."
        },
        {
          "title": "Roofline: An Insightful Visual Performance Model for Multicore Architectures",
          "why": "이 논문이 토대로 쓰는 ‘루프라인’ 성능 분석의 기초 개념입니다."
        }
      ],
      "reading_order": "LLM 추론·서빙 기초 → 루프라인 모델 → vLLM(서빙 메모리 관리) → 본 논문 순이 좋습니다."
    }
  },
  "2026-06-29": {
    "date": "2026-06-29",
    "track": "AI",
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
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "8년 만에 3600배 — TPU가 걸어온 길",
          "body": "이 논문은 Google이 2017년부터 2025년까지 만들어 온 AI 학습용 전용 칩 TPU의 5세대 발전사를 정리한 보고서입니다. 핵심 수치만 보면 이렇습니다. 칩 한 개의 연산 성능은 46 TFLOPS(TPU v2)에서 4614 TFLOPS(Ironwood)로 약 100배 올랐고, 슈퍼컴퓨터 전체 성능은 무려 3600배 뛰었습니다. 같은 기간 전력 대비 성능도 약 30배 개선됐습니다. 단순히 '칩이 빨라졌다'는 이야기가 아니라, AI 인프라가 어떤 방향으로 진화하는지를 보여주는 설계도입니다."
        },
        {
          "heading": "설계는 그대로, 부품만 키웠다 — 안정적 아키텍처의 힘",
          "body": "보통 새 칩을 만들면 내부 구조를 크게 뜯어고칩니다. 그런데 TPU는 2017년 v2에서 정한 기본 설계 틀을 8년 내내 바꾸지 않았습니다. 대신 핵심 연산 블록(MXU)을 2개 128×128 배열에서 4개 256×256 배열로 키우고, HBM 스택 수를 2개에서 8개로 늘리는 방식으로 성능을 끌어올렸습니다. 이 전략 덕분에 AI 모델이 MLP → RNN → Transformer로 급변하는 동안에도 소프트웨어 최적화 비용을 낮게 유지할 수 있었습니다. 논문은 이를 '아키텍처 안정성'이라 부르며, 성공한 AI 가속기의 핵심 조건으로 꼽습니다."
        },
        {
          "heading": "HBM이 없으면 TPU도 없다 — 메모리가 성능을 결정한다",
          "body": "TPU 성능 도약의 물리적 토대는 HBM(고대역폭 메모리)입니다. TPU v2는 HBM2 스택 2개로 16GiB·700GB/s를 제공했지만, Ironwood는 HBM3E 스택 8개로 192GiB·7300GB/s를 달성했습니다. 용량은 12배, 대역폭은 10배 이상 늘었습니다. 슈퍼컴퓨터 전체로 보면 공유 메모리 총량이 4TB(v2)에서 1.77PB(Ironwood)로 400배 이상 확장됐으며, 이는 AI 슈퍼컴퓨터 사상 최대 기록입니다. 연산 칩이 아무리 빨라도 데이터를 제때 공급하지 못하면 의미가 없기 때문에, HBM의 세대 교체가 곧 TPU 세대 교체를 이끄는 구조입니다."
        }
      ],
      "key_terms": [
        {
          "term": "HBM (고대역폭 메모리, High Bandwidth Memory)",
          "explain": "D램 칩을 수직으로 여러 층 쌓아 데이터를 매우 빠르게 주고받을 수 있게 만든 메모리입니다. AI 칩이 초당 처리하는 데이터량을 결정하는 핵심 부품으로, SK하이닉스의 주력 제품입니다."
        },
        {
          "term": "MXU (행렬 곱셈 유닛, Matrix Multiply Unit)",
          "explain": "AI 연산의 대부분을 차지하는 행렬 곱셈을 전담하는 TPU의 핵심 연산 블록입니다. TPU v2의 128×128 배열에서 Ironwood의 256×256·512×512 배열로 세대마다 커졌습니다."
        },
        {
          "term": "BF16 / FP8 (부동소수점 숫자 형식)",
          "explain": "숫자를 얼마나 정밀하게 표현할지 결정하는 형식입니다. 비트 수가 작을수록 정밀도는 낮지만 연산 속도가 빠릅니다. Google은 AI에서는 정밀도보다 범위가 중요하다고 판단해 BF16을 먼저 도입했고, Ironwood에서는 더 빠른 FP8까지 지원합니다."
        },
        {
          "term": "ICI (칩 간 연결망, Inter-Chip Interconnect)",
          "explain": "수천 개의 TPU 칩을 하나의 슈퍼컴퓨터처럼 묶어주는 전용 고속 통신망입니다. Ironwood 기준으로 슈퍼컴퓨터 전체 대역폭이 76,800GB/s에 달합니다."
        },
        {
          "term": "SparseCore",
          "explain": "추천 시스템·검색 등에 쓰이는 '희소 데이터' 처리를 전담하는 보조 연산 코어입니다. 칩 면적의 약 5%만 차지하지만, Transformer 시대에는 AllReduce 같은 집합 통신 작업도 분담해 TensorCore의 부담을 줄여줍니다."
        },
        {
          "term": "XLA / JAX (TPU 소프트웨어 스택)",
          "explain": "XLA는 TPU가 연산을 효율적으로 실행하도록 코드를 최적화하는 컴파일러이고, JAX는 그 위에서 AI 모델을 작성하는 프로그래밍 언어입니다. 아키텍처가 안정적이었기 때문에 소프트웨어 스택도 세대를 넘어 재사용할 수 있었습니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "HBM 수요는 유행이 아니라 구조입니다",
          "body": "이 논문이 보여주는 가장 중요한 사실은, TPU 세대 교체의 핵심 동력이 매번 HBM의 업그레이드였다는 점입니다. v2→v3에서 스택 수가 2→4개로, v5p→Ironwood에서 HBM2E→HBM3E로 바뀌며 대역폭이 2765→7300GB/s로 뛰었습니다. Google뿐 아니라 모든 AI 가속기가 같은 병목(연산 속도 대비 메모리 공급 속도)을 안고 있기 때문에, HBM 수요는 특정 고객사에 의존하는 것이 아니라 AI 인프라 전체의 구조적 수요입니다. SK하이닉스 입장에서는 HBM3E 이후 세대(HBM4 등)의 양산 타이밍과 수율이 곧 시장 점유율을 결정하는 변수가 됩니다."
        },
        {
          "heading": "슈퍼컴퓨터 규모 확장이 곧 HBM 총량 확장입니다",
          "body": "Ironwood 슈퍼컴퓨터 한 대의 HBM 총량은 1.77PB로, TPU v2(4TB) 대비 400배 이상입니다. 칩 한 개의 HBM 용량이 늘어나는 것과 동시에, 슈퍼컴퓨터를 구성하는 TPU 수도 256개(v2)에서 9216개(Ironwood)로 36배 늘었습니다. 즉 HBM 수요는 '칩당 용량 증가'와 '칩 수 증가'가 동시에 작용하는 이중 성장 구조입니다. 논문이 제시한 연평균 성능 성장률 약 100%가 유지된다면, SK하이닉스의 HBM 출하량 전망도 이 성장률에 연동해 볼 수 있습니다."
        },
        {
          "heading": "HBM 세대 전환 속도가 SK하이닉스의 경쟁력을 가릅니다",
          "body": "논문은 TPU v5p에서 HBM2E를, Ironwood에서 HBM3E를 채택했다고 명시합니다. Google이 차세대 TPU를 설계할 때 가장 먼저 확정하는 부품 중 하나가 HBM 사양이라는 뜻입니다. 이는 HBM 공급사가 고객의 칩 설계 일정보다 앞서 차세대 제품을 준비해야 한다는 의미이기도 합니다. SK하이닉스가 HBM4 이상의 개발·양산 일정에서 경쟁사보다 앞서 있다면, Google·NVIDIA 등 주요 고객의 차세대 플랫폼에 선탑재될 가능성이 높아집니다. 반대로 수율이나 공급 일정에서 뒤처지면 설계 단계부터 배제될 위험도 있습니다."
        }
      ],
      "background_papers": [
        {
          "title": "In-Datacenter Performance Analysis of a Tensor Processing Unit (Jouppi et al., 2017, ISCA)",
          "why": "TPU v1의 설계 철학과 GPU 대비 30배 전력 효율의 근거를 담은 원조 논문으로, 이 보고서가 전제하는 모든 개념의 출발점입니다."
        },
        {
          "title": "TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning with Hardware Support for Embeddings (Jouppi et al., 2023)",
          "why": "본문이 가장 많이 인용하는 직전 세대 논문으로, SparseCore·광학 스위치 등 Ironwood까지 이어지는 핵심 기술의 상세 설명이 담겨 있어 이 보고서의 '중간 다리' 역할을 합니다."
        }
      ],
      "reading_order": "TPU v1 원조 논문(2017)으로 기본 개념을 잡은 뒤 TPU v4 논문(2023)으로 SparseCore·광학 스위치를 이해하고, 마지막으로 이 보고서를 읽으면 5세대 전체 흐름이 자연스럽게 연결됩니다."
    }
  },
  "2026-06-30": {
    "date": "2026-06-30",
    "track": "반도체",
    "paper": {
      "title": "Memory-Centric Computing: Security Benefits and Challenges of Processing-in-DRAM",
      "authors": [
        "Ismail Emir Yuksel",
        "F. Nisa Bostanci",
        "Ataberk Olgun",
        "Onur Mutlu"
      ],
      "published": "2026-06-18",
      "url": "http://arxiv.org/abs/2606.20786v1",
      "arxiv_id": "2606.20786"
    },
    "tag": "기회",
    "scores": {
      "business": 5,
      "threat": 2,
      "demand": 4,
      "maturity": 2,
      "credibility": 5,
      "novelty": 4
    },
    "final_score": 4.85,
    "based_on": "fulltext",
    "deep": {
      "summary_sections": [
        {
          "heading": "데이터를 옮기지 말고, 메모리가 직접 계산하게 하라",
          "body": "오늘날 컴퓨터는 ‘프로세서 중심’이에요 — 메모리는 그냥 저장만 하고, 계산하려면 데이터를 CPU로 옮겨야 합니다. 그런데 데이터를 옮기는 일은 계산보다 훨씬 비싸요(에너지·시간·대역폭). 생성형 AI처럼 데이터가 폭증하는 시대엔 이 ‘데이터 이동’이 가장 큰 병목입니다. 그래서 계산을 데이터가 있는 메모리 쪽으로 가져가자는 게 ‘메모리 중심 컴퓨팅’이고, DRAM 안에서 하면 Processing-in-DRAM(PiD)입니다."
        },
        {
          "heading": "보안에 좋은 점: 메모리가 ‘진짜 난수·칩 지문’을 만든다",
          "body": "이 논문은 PiD의 보안 양면성을 정리합니다. 좋은 점은, 일반 DRAM의 타이밍을 살짝 비틀면 예측 불가능한 진짜 난수(TRNG, 최대 16Gb/s)나 칩마다 고유한 지문(PUF)을 만들 수 있다는 거예요 — 별도 보안칩 없이 메모리가 보안 기능을 떠안고, 암호 연산(FHE)도 가속합니다."
        },
        {
          "heading": "보안에 나쁜 점: 새 공격 표면도 생긴다",
          "body": "반대로 위험도 커집니다. 메모리에서 직접 연산하다 보면 읽기 교란이 크게 악화되고(비트플립을 일으키는 접근 횟수가 최대 158배 줄어듦), 메모리 동작의 미세한 시간차를 악용한 정보 유출 통로(초당 14.8Mb)도 생깁니다. PiD는 강력하지만, 신뢰성·보안 설계를 반드시 함께 가져가야 합니다."
        }
      ],
      "key_terms": [
        {
          "term": "프로세서 중심 vs 메모리 중심",
          "explain": "계산을 CPU에서 하느냐(기존), 데이터가 있는 메모리에서 하느냐(새 패러다임)의 차이입니다."
        },
        {
          "term": "데이터 이동 병목",
          "explain": "계산보다 데이터를 옮기는 데 에너지·시간이 더 드는 구조적 한계로, AI 시대의 핵심 문제입니다."
        },
        {
          "term": "PIM / Processing-in-DRAM",
          "explain": "DRAM 안에서 직접 연산하는 기술로, 데이터 이동을 줄여 속도와 전력을 크게 개선합니다."
        },
        {
          "term": "TRNG·PUF",
          "explain": "DRAM 특성으로 만들 수 있는 진성 난수와 칩 고유 지문으로, 하드웨어 보안의 기초 요소입니다."
        },
        {
          "term": "FHE(동형암호)",
          "explain": "암호화된 상태 그대로 계산하는 차세대 보안 기술로, PiD로 가속할 수 있습니다."
        },
        {
          "term": "읽기 교란·타이밍 채널",
          "explain": "PiD가 키울 수 있는 위험으로, 비트플립 악화와 정보 유출 통로를 말합니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "PIM은 SK하이닉스의 미래 먹거리 — 직접 사업영역",
          "body": "SK하이닉스는 이미 PIM 제품(예: GDDR6 기반 AiM)을 개발하며 PIM을 차세대 사업으로 키우고 있어요. 이 논문은 ‘AI 시대에 데이터 이동이 진짜 병목’임을 학술적으로 뒷받침하고, 메모리가 계산까지 떠안는 PiD의 당위성을 보여줍니다. 게다가 3D 적층 메모리의 로직 계층(HBM과 같은 구조)에서도 PiD가 가능하다고 언급해, HBM 기반 ‘연산하는 메모리’로 가치를 키울 기회 신호입니다."
        },
        {
          "heading": "기회의 전제: 신뢰성·보안을 함께 풀어야 한다",
          "body": "다만 논문은 PiD가 읽기 교란 악화(최대 158배)와 정보 유출 같은 새 리스크를 동반함을 분명히 경고합니다. PIM을 상용화하려면 이 신뢰성·보안 문제를 함께 해결해야 하고, 그걸 먼저 푸는 제조사가 ‘안전한 연산 메모리’ 시장을 선점합니다."
        }
      ],
      "background_papers": [
        {
          "title": "Processing-in-Memory: A Workload-Driven Perspective (Mutlu et al.)",
          "why": "PIM이 왜 필요하고 어디에 쓰이는지 큰 그림을 먼저 잡을 수 있습니다."
        },
        {
          "title": "RowHammer 및 DRAM read disturbance 서베이",
          "why": "이 논문이 경고하는 ‘읽기 교란 악화’ 리스크의 배경을 이해할 수 있습니다."
        }
      ],
      "reading_order": "데이터 이동 병목·PIM 개념 → PIM 개관 논문 → DRAM 읽기 교란 배경 → 본 논문 순으로 보면 ‘PIM의 약속과 리스크’가 함께 이해됩니다."
    }
  }
};
