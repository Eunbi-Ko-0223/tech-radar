"""
논문 본문 추출 — arXiv PDF를 내려받아 텍스트를 뽑는다(초록만으론 깊이가 부족하므로).
PyMuPDF(fitz) 사용. 실패하면 빈 문자열을 반환해 호출부가 초록으로 대체하게 한다.
비용/토큰 절약을 위해 본문은 max_chars로 자른다.
"""
import requests

PDF_URL = "https://arxiv.org/pdf/{aid}"


def get_fulltext(arxiv_id, max_chars=16000, verbose=True):
    try:
        import fitz  # PyMuPDF
    except Exception:
        if verbose:
            print("[fulltext] PyMuPDF 미설치 — 본문 생략(초록 사용)")
        return ""
    try:
        r = requests.get(PDF_URL.format(aid=arxiv_id), timeout=60,
                         headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code != 200:
            if verbose:
                print(f"[fulltext] PDF 응답 {r.status_code} — 본문 생략")
            return ""
        doc = fitz.open(stream=r.content, filetype="pdf")
        text = "".join(page.get_text() for page in doc)
        if verbose:
            print(f"[fulltext] 본문 {len(text):,}자 추출 (앞 {max_chars:,}자 사용)")
        return text[:max_chars]
    except Exception as e:
        if verbose:
            print(f"[fulltext] 추출 실패({e}) — 본문 생략")
        return ""
