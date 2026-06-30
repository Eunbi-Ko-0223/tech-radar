// 정적 사이트 렌더러 — window.RADAR_DATA(data.js)만 읽는다. API 호출 없음.
(function () {
  const DATA = window.RADAR_DATA || {};
  const dates = Object.keys(DATA).sort();          // 오래된→최신
  const latest = dates[dates.length - 1];
  let selected = latest;

  const SCORE_LABELS = {
    business: "사업연관성", threat: "위협신호", demand: "수요신호",
    maturity: "성숙도", credibility: "출처신뢰도", novelty: "신규성",
  };
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];

  const $ = (s) => document.querySelector(s);
  const esc = (t) => (t == null ? "" : String(t).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])));

  // ---------- 논문 패널 ----------
  function renderPaper(date) {
    const rec = DATA[date];
    const pane = $("#paper-pane");
    if (!rec) {
      pane.innerHTML = `<div class="eyebrow"><span class="date">${esc(date)}</span></div>
        <p class="summary">이 날은 추천된 논문이 없습니다. ☕<br>(품질 기준선 미달 — 억지 추천 대신 쉬어가는 날)</p>`;
      return;
    }
    if (rec.no_recommendation) {
      pane.innerHTML = `
        <div class="eyebrow"><span class="tag 중립">추천 없음</span>
          <span class="date">${esc(date)} · 쉬어가는 날</span></div>
        <h2 class="paper-title">오늘은 추천할 만한 논문이 없어요 ☕</h2>
        <div class="block"><div class="summary">${esc(rec.reason || "품질 기준선 미달")}로 인해,
          억지로 별로인 논문을 추천하기보다 오늘은 쉬어갑니다.
          내일 아침 더 좋은 논문으로 다시 찾아올게요!</div></div>`;
      return;
    }
    const d = rec.deep || {};
    const tag = rec.tag || "중립";
    const isToday = date === latest;

    // v2: 소제목+본문 구조 렌더. v1 데이터(문자열)면 그대로 한 단락으로.
    const sectionsHTML = (sections, fallback) => {
      if (Array.isArray(sections) && sections.length)
        return sections.map(s =>
          `<div class="sub-block"><h4>${esc(s.heading)}</h4><p>${esc(s.body)}</p></div>`).join("");
      return `<p>${esc(fallback)}</p>`;
    };

    const scores = Object.entries(rec.scores || {}).map(([k, v]) => `
      <div class="score-row">
        <span class="lab">${SCORE_LABELS[k] || k}</span>
        <span class="bar"><span style="width:${(v / 5) * 100}%"></span></span>
        <span class="val">${v}</span>
      </div>`).join("");

    const terms = (d.key_terms || []).map(t =>
      `<div class="term"><b>${esc(t.term)}</b> — ${esc(t.explain)}</div>`).join("");

    const bg = (d.background_papers || []);
    const pkg = bg.length
      ? bg.map(b => `<div class="bg-paper">📄 <b>${esc(b.title)}</b><br><span style="color:var(--muted)">→ ${esc(b.why)}</span></div>`).join("")
        + (d.reading_order ? `<div class="order">🧭 ${esc(d.reading_order)}</div>` : "")
      : `<div class="empty">${esc(d.reading_order) || "이 논문과 함께 볼 배경 논문은 아직 정리되지 않았어요."}</div>`;

    pane.innerHTML = `
      <div class="eyebrow">
        <span class="tag ${tag}">${tag}</span>
        <span class="date">${esc(date)} · ${isToday ? "오늘의 논문" : "지난 추천"}${rec.track ? ` · ${esc(rec.track)} 트랙` : ""}</span>
      </div>
      <h2 class="paper-title">${esc(rec.paper.title)}</h2>
      <div class="paper-meta">
        ${esc((rec.paper.authors || []).slice(0, 4).join(", "))}${(rec.paper.authors || []).length > 4 ? " 외" : ""}
        · 제출 ${esc(rec.paper.published)} ·
        <a href="${esc(rec.paper.url)}" target="_blank" rel="noopener">arXiv 원문 ↗</a>
      </div>

      <div class="block"><h3><span class="ic">🔎</span>쉬운 요약</h3>
        <div class="summary">${sectionsHTML(d.summary_sections, d.easy_summary)}</div></div>

      <div class="block"><h3><span class="ic">💡</span>SK하이닉스에게 무슨 의미?</h3>
        <div class="why ${tag}">${sectionsHTML(d.implication_sections, d.why_matters)}</div></div>

      ${terms ? `<div class="block"><h3><span class="ic">📖</span>용어 풀이</h3><div class="terms">${terms}</div></div>` : ""}

      <div class="block"><h3><span class="ic">📚</span>함께 공부하면 좋은 논문 (학습 패키지)</h3>
        <div class="pkg">${pkg}</div></div>

      <div class="block"><h3><span class="ic">📊</span>평가 점수 (0~5)</h3>
        <div class="scores">${scores}</div></div>
    `;
  }

  // ---------- 달력 ----------
  let calYear, calMonth; // 보고 있는 달
  function initCalMonth() {
    const [y, m] = selected.split("-").map(Number);
    calYear = y; calMonth = m - 1; // 0-based
  }
  function renderCalendar() {
    const view = $("#calendar-view");
    const first = new Date(calYear, calMonth, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    let cells = "";
    for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const has = DATA[ds] != null;
      const sel = ds === selected;
      const cls = ["cal-cell", has ? "has" : "", sel ? "sel" : ""].filter(Boolean).join(" ");
      cells += `<div class="${cls}" ${has ? `data-date="${ds}"` : ""}>${day}</div>`;
    }

    view.innerHTML = `
      <div class="cal-head">
        <button id="cal-prev">‹</button>
        <span>${calYear}년 ${calMonth + 1}월</span>
        <button id="cal-next">›</button>
      </div>
      <div class="cal-grid">
        ${DOW.map(d => `<div class="dow">${d}</div>`).join("")}
        ${cells}
      </div>`;

    $("#cal-prev").onclick = () => { if (--calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); };
    $("#cal-next").onclick = () => { if (++calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); };
    view.querySelectorAll(".cal-cell.has").forEach(c =>
      c.onclick = () => select(c.dataset.date));
  }

  // ---------- 리스트 ----------
  function renderList() {
    const view = $("#list-view");
    view.innerHTML = dates.slice().reverse().map(ds => {
      const rec = DATA[ds];
      const sel = ds === selected ? "sel" : "";
      if (rec.no_recommendation) {
        return `<div class="list-item ${sel}" data-date="${ds}">
          <div class="li-date">${ds}</div>
          <div class="li-title">☕ 추천 없음 (쉬어가는 날)</div>
          <span class="tag 중립">없음</span>
        </div>`;
      }
      return `<div class="list-item ${sel}" data-date="${ds}">
        <div class="li-date">${ds}</div>
        <div class="li-title">${esc(rec.paper.title)}</div>
        <span class="tag ${rec.tag}">${rec.tag}</span>
      </div>`;
    }).join("");
    view.querySelectorAll(".list-item").forEach(it =>
      it.onclick = () => select(it.dataset.date));
  }

  // ---------- 선택 변경 ----------
  function select(date) {
    selected = date;
    renderPaper(date);
    renderCalendar();
    renderList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- 뷰 토글 ----------
  $("#btn-cal").onclick = () => {
    $("#btn-cal").classList.add("active"); $("#btn-list").classList.remove("active");
    $("#calendar-view").classList.remove("hidden"); $("#list-view").classList.add("hidden");
  };
  $("#btn-list").onclick = () => {
    $("#btn-list").classList.add("active"); $("#btn-cal").classList.remove("active");
    $("#list-view").classList.remove("hidden"); $("#calendar-view").classList.add("hidden");
  };

  // ---------- 시작 ----------
  if (!latest) {
    $("#paper-pane").innerHTML = `<p class="summary">아직 추천된 논문이 없습니다. main.py를 실행한 뒤 build_site.py로 사이트를 갱신하세요.</p>`;
    return;
  }
  initCalMonth();
  renderPaper(selected);
  renderCalendar();
  renderList();
})();
