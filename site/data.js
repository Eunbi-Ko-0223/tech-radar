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
      "novelty": 3
    },
    "final_score": 4.35,
    "based_on": "abstract",
    "deep": {
      "summary_sections": [
        {
          "heading": "LLM의 ‘기억 창고’ KV 캐시가 터지고 있다",
          "body": "요즘 LLM은 긴 문서를 읽거나(롱컨텍스트) 스스로 여러 단계를 이어 수행하는(에이전트) 식으로 점점 길게 동작합니다. 이때 모델이 ‘방금까지 본 내용’을 저장해 두는 공간이 KV 캐시인데, 작업이 길어질수록 이 캐시가 정해진 메모리 한도를 넘어 폭발합니다. 그래서 추론 시스템은 매 순간 오래된 토큰을 강제로 버려야(eviction) 하죠."
        },
        {
          "heading": "문제는 ‘중요한 걸 영영 잘못 버린다’는 것",
          "body": "기존 방식은 매 순간 점수가 낮은 토큰을 칼같이 잘라 버리는데, 한 번 버리면 되돌릴 수 없어 사실은 중요했던 토큰까지 영구히 날립니다. 이 논문의 Nexus Sampling은 ‘확률적으로’ 남기는 방식으로, 미묘하게 중요한 연결고리 토큰을 더 잘 살려둡니다. 추가 학습 없이 바로 적용되며, KV 캐시를 80%나 줄여도 성능이 거의 떨어지지 않았습니다."
        }
      ],
      "key_terms": [
        {
          "term": "KV 캐시",
          "explain": "LLM이 추론 중 ‘앞서 본 토큰들의 계산 결과’를 저장해 두는 메모리입니다. 길이가 길어질수록 커져 메모리를 많이 잡아먹는 핵심 병목입니다."
        },
        {
          "term": "롱컨텍스트(long context)",
          "explain": "모델이 한 번에 처리하는 입력이 매우 긴 경우로, 긴 문서·코드·대화를 다룰 때입니다."
        },
        {
          "term": "에이전트(agentic)",
          "explain": "AI가 사람 개입 없이 여러 단계를 스스로 이어 수행하는 방식으로, 동작이 길어 메모리 부담이 큽니다."
        },
        {
          "term": "축출(eviction)",
          "explain": "메모리가 부족할 때 오래되거나 덜 중요한 데이터를 버리는 동작입니다."
        },
        {
          "term": "training-free",
          "explain": "모델을 추가로 학습시키지 않고도 바로 적용할 수 있는 기법을 말합니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "‘메모리가 AI의 1차 병목’이라는 증거",
          "body": "이 논문이 통째로 말하는 건 LLM 추론에서 메모리(KV 캐시)가 가장 먼저 터지는 한계라는 점입니다. 롱컨텍스트·에이전트가 대세가 될수록 더 많고 더 빠른 메모리가 필요하다는 뜻이라, SK하이닉스 HBM 수요의 구조적 동력이 됩니다."
        },
        {
          "heading": "효율화는 양날의 칼 — 그래도 큰 흐름은 순풍",
          "body": "KV 캐시를 80%까지 줄이는 기법은 단기적으론 ‘메모리 절약’처럼 보일 수 있습니다. 하지만 효율화는 더 큰 모델·더 긴 컨텍스트 사용을 부추겨 결국 총 메모리 수요를 키워온 역사가 있습니다(제본스의 역설). 따라서 큰 그림은 여전히 HBM 수요 확대 쪽입니다."
        }
      ],
      "background_papers": [
        {
          "title": "Attention Is All You Need (Vaswani et al., 2017) — 트랜스포머 원조 논문",
          "why": "KV 캐시가 왜 생기는지(어텐션 구조) 이해하는 출발점입니다."
        },
        {
          "title": "롱컨텍스트 LLM의 KV 캐시 압축 서베이",
          "why": "이 논문이 속한 ‘KV 캐시 줄이기’ 연구 흐름 전반을 먼저 조망할 수 있습니다."
        }
      ],
      "reading_order": "트랜스포머·어텐션 기초 → KV 캐시 압축 흐름 서베이 → 본 논문 순으로 보면 ‘왜 메모리가 병목인지’가 자연스럽게 이해됩니다."
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
    "based_on": "abstract",
    "deep": {
      "summary_sections": [
        {
          "heading": "DRAM의 새로운 약점: ‘행’이 아니라 ‘열’이 흔들린다",
          "body": "DRAM은 데이터를 무수한 칸(셀)에 저장하는데, 특정 행을 반복해서 읽으면 옆 셀 값이 뒤집히는 RowHammer가 잘 알려진 문제였습니다. 이 논문은 그와 근본적으로 다른 새 현상 ‘ColumnDisturb’를 발견했습니다. 행이 아니라 ‘열’ 방향으로 교란이 일어나고, 피해 범위도 인접 몇 행이 아니라 연속된 3개 서브어레이 전체로 훨씬 넓습니다."
        },
        {
          "heading": "해법: 낮은 비용으로 막는 ColumnKeeper",
          "body": "저자들은 이를 막는 첫 대응책 ColumnKeeper를 제안합니다. DRAM의 구조(오픈 비트라인)를 활용해 카운터로 교란을 추적하고, 위험해지면 해당 행을 새로고침(refresh)합니다. 성능 저하는 0.15~1.7% 수준으로 매우 낮고 추가 면적도 작습니다. 메모리 분야 최고 연구그룹(CMU SAFARI)의 성과라 신뢰도가 높습니다."
        }
      ],
      "key_terms": [
        {
          "term": "DRAM",
          "explain": "컴퓨터의 주기억장치로 쓰이는 휘발성 메모리로, SK하이닉스의 핵심 주력 제품입니다."
        },
        {
          "term": "RowHammer",
          "explain": "특정 행을 반복 접근하면 이웃 셀의 값이 뒤집히는 DRAM 교란 현상이자 보안 취약점입니다."
        },
        {
          "term": "ColumnDisturb",
          "explain": "이 논문이 처음 보고한 새 교란 현상으로, 열 방향으로 더 넓은 범위의 셀을 동시에 교란시킵니다."
        },
        {
          "term": "서브어레이(subarray)",
          "explain": "DRAM 내부를 잘게 나눈 셀 묶음 단위로, 이 현상은 3개 서브어레이에 걸쳐 영향을 줍니다."
        },
        {
          "term": "리프레시(refresh)",
          "explain": "DRAM이 데이터를 유지하려 주기적으로 값을 다시 써주는 동작으로, 대응책의 핵심 수단입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "미세화될수록 새 결함이 나온다 — 제조사의 숙제",
          "body": "ColumnDisturb는 DRAM을 더 촘촘히(미세하게) 만들수록 이런 새 교란 현상이 계속 나타날 수 있음을 보여줍니다. SK하이닉스 같은 DRAM 제조사에겐 직접적인 신뢰성 위협 신호이자, 양산 전에 선제적 대응 설계를 갖춰야 한다는 과제입니다."
        },
        {
          "heading": "위협이자 기회 — 신뢰성이 곧 경쟁력",
          "body": "다만 이런 결함을 먼저 이해하고 낮은 비용의 방어책을 칩에 내재화하면 ‘신뢰성 높은 메모리’가 차별화 포인트가 됩니다. 특히 서버·AI용 고신뢰 메모리 시장에서 결함 대응력은 곧 제품 경쟁력으로 이어집니다."
        }
      ],
      "background_papers": [
        {
          "title": "Flipping Bits in Memory Without Accessing Them (Kim et al., 2014) — RowHammer 원조",
          "why": "ColumnDisturb를 이해하려면 먼저 RowHammer가 무엇인지 알아야 합니다."
        },
        {
          "title": "DRAM read disturbance 서베이/튜토리얼",
          "why": "DRAM 교란 현상 전반과 대응책의 흐름을 조망할 수 있습니다."
        }
      ],
      "reading_order": "RowHammer 기초 → DRAM 교란 현상 서베이 → 본 논문(ColumnDisturb) 순으로 보면 새 위협의 의미가 또렷해집니다."
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
    "based_on": "abstract",
    "deep": {
      "summary_sections": [
        {
          "heading": "트랜스포머 말고 다른 길: 상태공간모델(SSM)",
          "body": "오늘날 거의 모든 AI(챗봇 등)는 ‘트랜스포머’ 구조를 쓰는데, 입력이 길어질수록 메모리(KV 캐시)를 많이 먹는 약점이 있습니다. 대안으로 주목받는 게 ‘상태공간모델(SSM)’입니다. 긴 내용을 ‘압축된 상태’ 하나로 계속 갱신하며 처리해, 길이가 늘어도 메모리가 거의 커지지 않는 게 장점입니다."
        },
        {
          "heading": "이 논문이 한 일: SSM을 ‘긴 문맥’ 작업에 효율적으로 붙이기",
          "body": "거대 모델을 통째로 다시 학습하지 않고, 작은 SSM 모듈만 끼워넣어(adapter) 긴 문맥 작업 성능을 끌어올리는 방법을 제안합니다. 기존 인기 방식(LoRA)보다 긴 문서 요약·이해에서 크게 앞섰고 계산 비용은 비슷했습니다. 즉 ‘SSM이 실전 긴 문맥 작업에서 쓸모 있다’는 걸 보인 것입니다."
        }
      ],
      "key_terms": [
        {
          "term": "트랜스포머",
          "explain": "챗GPT 등 현대 AI의 기반 구조입니다. 문맥 이해에 강하지만 길이가 길수록 메모리를 많이 씁니다."
        },
        {
          "term": "상태공간모델(SSM)",
          "explain": "긴 시퀀스를 ‘압축된 상태’로 처리해 메모리 증가가 거의 없는 대안 구조입니다(예: Mamba 계열)."
        },
        {
          "term": "KV 캐시",
          "explain": "트랜스포머가 추론 중 앞선 토큰을 저장하는 메모리로, 길이에 비례해 커집니다."
        },
        {
          "term": "어댑터(adapter)/LoRA",
          "explain": "큰 모델 전체를 재학습하지 않고 작은 모듈만 추가로 학습하는 효율적 미세조정 기법입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "AI의 ‘메모리 사용 방식’이 바뀔 수 있다는 신호",
          "body": "트랜스포머는 길이에 비례해 메모리를 먹지만 SSM은 그렇지 않습니다. 만약 SSM 계열이 확산되면 AI의 메모리 접근 패턴(용량·대역폭 요구)이 달라질 수 있어, SK하이닉스가 주시해야 할 ‘구조 변화’ 신호입니다."
        },
        {
          "heading": "단기 위협보단 장기 관찰 포인트",
          "body": "다만 아직 연구 단계이고, 현실의 대형 모델은 여전히 트랜스포머 중심이라 HBM 수요엔 당장 영향이 적습니다. 오히려 긴 문맥 수요 자체가 커지는 흐름이라 ‘어떤 구조가 이기든 메모리 총량은 늘어난다’는 큰 그림은 유지됩니다. 구조 경쟁의 향방을 추적할 가치가 있습니다."
        }
      ],
      "background_papers": [
        {
          "title": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces — SSM 대표 논문",
          "why": "SSM이 무엇이고 왜 트랜스포머의 대안인지 핵심을 잡을 수 있습니다."
        },
        {
          "title": "LoRA: Low-Rank Adaptation of Large Language Models",
          "why": "이 논문이 비교 기준으로 삼는 효율적 미세조정 기법을 이해하면 기여가 또렷해집니다."
        }
      ],
      "reading_order": "트랜스포머·KV 캐시 개념 → Mamba(SSM 기초) → LoRA → 본 논문 순으로 보면 ‘구조 대안’ 논의가 잘 이해됩니다."
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
      "credibility": 3,
      "novelty": 3
    },
    "final_score": 3.9,
    "based_on": "abstract",
    "deep": {
      "summary_sections": [
        {
          "heading": "LLM을 ‘실제로 돌릴 때’ 성능을 미리 예측하기",
          "body": "LLM을 서비스로 운영하려면 ‘어떤 하드웨어에서, 어떤 설정으로, 얼마나 빠르고 비싸게 돌아가는지’를 빠르게 가늠해야 합니다. 그런데 실제로는 서빙 정책과 GPU의 저수준 동작이 복잡하게 얽혀, 매번 직접 벤치마크를 돌려야 하는 번거로움이 있었습니다."
        },
        {
          "heading": "KernelSight-LM: 커널 수준까지 쪼개 시뮬레이션",
          "body": "이 논문은 LLM 추론을 토큰 단위로 시뮬레이션해 ‘GPU 커널별 지연시간’까지 분해해 보여주는 도구를 제안합니다. 특히 실제 측정 데이터 없이도 하드웨어 사양만으로 새 GPU의 성능을 예측하는 모드가 있어, 하드웨어를 바꿔가며 비용·속도를 빠르게 비교할 수 있습니다."
        }
      ],
      "key_terms": [
        {
          "term": "추론(inference)·서빙(serving)",
          "explain": "학습된 AI 모델을 실제 사용자 요청에 응답시키는 운영 단계를 말합니다."
        },
        {
          "term": "GPU 커널",
          "explain": "GPU에서 실제 계산을 수행하는 작은 프로그램 단위로, 추론 성능의 핵심입니다."
        },
        {
          "term": "루프라인(roofline) 모델",
          "explain": "성능이 ‘연산 한계’ 때문인지 ‘메모리 대역폭 한계’ 때문인지 가늠하는 분석 틀입니다."
        },
        {
          "term": "연속 배칭·프리픽스 캐싱",
          "explain": "여러 요청을 효율적으로 묶고 공통 부분을 재사용해 LLM 서빙 효율을 높이는 대표 기법들입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "메모리 대역폭이 추론 성능을 좌우한다",
          "body": "이런 도구가 커널·루프라인 수준으로 분석한다는 건, LLM 추론 성능이 ‘연산’만이 아니라 ‘메모리 대역폭’에 크게 좌우된다는 방증입니다. HBM처럼 빠른 메모리가 추론 비용·속도의 핵심 변수라는 뜻이라, SK하이닉스에 우호적 신호입니다."
        },
        {
          "heading": "AI 서빙 시장 확대 = 메모리 수요 확대",
          "body": "LLM이 연구를 넘어 ‘대규모 서비스 운영’으로 넘어갈수록 추론 인프라가 커지고 그만큼 고성능 메모리 수요가 늘어납니다. 이 논문은 그 운영 단계의 고민을 보여주는 사례로, 추론 시장 성장이 메모리 수요 성장으로 이어진다는 흐름을 뒷받침합니다."
        }
      ],
      "background_papers": [
        {
          "title": "Efficient Memory Management for LLM Serving with PagedAttention (vLLM)",
          "why": "LLM 서빙에서 메모리(KV 캐시) 관리가 왜 핵심인지 보여주는 대표 연구입니다."
        },
        {
          "title": "Roofline: An Insightful Visual Performance Model for Multicore Architectures",
          "why": "이 논문이 쓰는 ‘루프라인’ 성능 분석의 기초 개념을 잡을 수 있습니다."
        }
      ],
      "reading_order": "LLM 추론·서빙 기초 → 루프라인 성능 모델 → vLLM(서빙 메모리 관리) → 본 논문 순이 좋습니다."
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
    "based_on": "abstract",
    "deep": {
      "summary_sections": [
        {
          "heading": "데이터를 옮기지 말고, 메모리가 직접 계산하게 하라 (PIM)",
          "body": "지금 컴퓨터는 데이터를 메모리(DRAM)에서 CPU로 옮겨와 계산하는데, AI처럼 데이터가 많은 작업은 이 ‘옮기는 과정’에서 시간·전력의 대부분을 써버립니다(폰노이만 병목). 이 논문은 발상을 뒤집어, 메모리(DRAM) 안에서 직접 계산하게 하는 ‘Processing-in-DRAM’을 다룹니다. 데이터를 옮기지 않으니 훨씬 빠르고 전력 효율적이죠."
        },
        {
          "heading": "메모리가 계산까지 하면, 보안은 득이자 실",
          "body": "메모리를 ‘저장만 하는 곳’에서 ‘계산도 하는 곳’으로 바꾸면 보안에 양면성이 생긴다고 짚습니다. 좋은 점: DRAM으로 진짜 난수(TRNG)나 칩 고유 지문(PUF) 같은 새 보안 기능을 만들 수 있어요. 나쁜 점: 읽기 교란이 심해지거나 새로운 정보 유출 경로가 생길 수 있어요. PIM은 강력하지만 신뢰성·보안 설계를 함께 가져가야 합니다."
        }
      ],
      "key_terms": [
        {
          "term": "PIM / Processing-in-DRAM",
          "explain": "메모리(DRAM) 안에서 직접 연산을 수행하는 기술로, 데이터 이동을 줄여 속도와 전력을 크게 개선합니다."
        },
        {
          "term": "폰노이만 병목",
          "explain": "CPU와 메모리 사이에서 데이터를 주고받는 데 시간·전력이 몰리는 구조적 한계입니다."
        },
        {
          "term": "메모리 중심 컴퓨팅",
          "explain": "계산을 데이터(메모리)가 있는 곳으로 가져가는 새 패러다임입니다."
        },
        {
          "term": "TRNG(진성 난수 생성기)",
          "explain": "예측 불가능한 진짜 난수를 만드는 장치로, 보안의 기초가 됩니다."
        },
        {
          "term": "PUF(물리적 복제방지 기능)",
          "explain": "칩마다 다른 물리적 특성을 ‘지문’처럼 활용하는 보안 기술입니다."
        }
      ],
      "implication_sections": [
        {
          "heading": "PIM은 SK하이닉스의 미래 먹거리 — 직접 사업영역",
          "body": "SK하이닉스는 이미 PIM 제품(예: GDDR6 기반 AiM)을 개발하며 PIM을 차세대 사업으로 보고 있습니다. 이 논문은 ‘AI 시대에 데이터 이동이 진짜 병목’임을 보여주며 메모리가 계산까지 떠안는 PIM의 당위성을 뒷받침합니다. 단순 메모리를 넘어 ‘연산하는 메모리’로 가치를 키울 기회 신호입니다."
        },
        {
          "heading": "기회를 잡으려면 신뢰성·보안이 전제",
          "body": "다만 논문은 PIM이 읽기 교란 악화·정보 유출 같은 새 리스크도 동반함을 경고합니다. PIM 제품을 상용화하려면 이런 신뢰성·보안 문제를 함께 풀어야 하고, 그걸 먼저 해결하는 회사가 시장을 선점합니다."
        }
      ],
      "background_papers": [
        {
          "title": "Processing-in-Memory: A Workload-Driven Perspective (Mutlu et al.)",
          "why": "PIM이 왜 필요하고 어디에 쓰이는지 큰 그림을 먼저 잡을 수 있습니다."
        },
        {
          "title": "RowHammer 및 DRAM read disturbance 서베이",
          "why": "이 논문이 경고하는 PIM의 신뢰성·보안 리스크 배경을 이해할 수 있습니다."
        }
      ],
      "reading_order": "폰노이만 병목·PIM 개념 → PIM 개관 논문 → DRAM 교란 배경 → 본 논문 순으로 보면 ‘PIM의 약속과 리스크’가 함께 이해됩니다."
    }
  }
};
