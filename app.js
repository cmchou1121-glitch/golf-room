(function () {
  "use strict";

  // ---- 世界前十名選手（OWGR 2026 週次，名人標準） ----
  const PRO = [
    { r: 1, zh: "舍夫勒", en: "Scottie Scheffler", c: "USA", dd: 303.8, bs: 175.7, cs: 118.8, sm: 1.48, note: "鐵桿與 tee-to-green 精準，準度勝距離" },
    { r: 2, zh: "麥克羅伊", en: "Rory McIlroy", c: "NIR", dd: 320.2, bs: 185.6, cs: 123.5, sm: 1.50, note: "史上頂級開球距離，長打型" },
    { r: 3, zh: "卡梅倫·楊", en: "Cameron Young", c: "USA", dd: 308.9, bs: 0, cs: 121.9, sm: 0, note: "開球距離與桿頭速度名列前茅" },
    { r: 4, zh: "費茲派翠克", en: "Matt Fitzpatrick", c: "ENG", dd: 298.8, bs: 0, cs: 117.0, sm: 0, note: "果嶺周邊短桿招牌（SG 領先）" },
    { r: 5, zh: "亨利", en: "Russell Henley", c: "USA", dd: 293.4, bs: 0, cs: 0, sm: 0, note: "開球精準度頂尖（球道中心第一）" },
    { r: 6, zh: "羅斯", en: "Justin Rose", c: "ENG", dd: 298.0, bs: 165.0, cs: 114.7, sm: 1.46, note: "鐵桿進攻精準、經驗豐富" },
    { r: 7, zh: "弗利特伍德", en: "Tommy Fleetwood", c: "ENG", dd: 303.0, bs: 0, cs: 114.0, sm: 0, note: "開球精準＋頂級鐵桿" },
    { r: 8, zh: "克拉克", en: "Wyndham Clark", c: "USA", dd: 314.0, bs: 186.3, cs: 122.6, sm: 1.52, note: "開球距離與球速前段班" },
    { r: 9, zh: "森川", en: "Collin Morikawa", c: "USA", dd: 296.2, bs: 170.3, cs: 115.2, sm: 1.48, note: "鐵桿精準、揮桿效率高" },
    { r: 10, zh: "拉姆", en: "Jon Rahm", c: "ESP", dd: 314.0, bs: 181.0, cs: 120.0, sm: 0, note: "世界級開球手，距離穩定兼具" },
  ];

  // 對標基準（各桿距離，碼）。tour 比落點(carry)，差點帶比總距離(total)。
  const BENCHMARKS = {
    none: { label: "關閉", metric: "carry", clubs: {} },
    hcp25: { label: "差點25 距離帶", metric: "total", clubs: { D: 204, "3W": 175, "3H": 160, "5i": 143, "6i": 137, "7i": 132, "8i": 122, "9i": 108 } },
    hcp20: { label: "差點20 距離帶", metric: "total", clubs: { D: 225, "3W": 195, "3H": 180, "5i": 162, "6i": 151, "7i": 146, "8i": 138, "9i": 129 } },
    lpga: { label: "LPGA Tour", metric: "carry", clubs: { D: 218, "3W": 195, "5i": 161, "6i": 152, "7i": 141, "8i": 130, "9i": 119, PW: 107 } },
    pga: { label: "PGA Tour（名人）", metric: "carry", clubs: { D: 275, "3W": 243, "3H": 225, "5i": 194, "6i": 183, "7i": 172, "8i": 160, "9i": 148, PW: 136 } },
  };

  // 球袋順序（短→長），未列到的球桿會自動接在後面
  const BAG_ORDER = ["LW", "SW", "W", "GW", "AW", "PW", "9i", "8i", "7i", "6i", "5i", "4i", "3i", "2i", "6H", "5H", "4H", "3H", "2H", "9W", "7W", "5W", "4W", "3W", "2W", "D"];
  const WOODS = { "2H": 1, "3H": 1, "4H": 1, "5H": 1, "6H": 1, "2W": 1, "3W": 1, "4W": 1, "5W": 1, "7W": 1, "9W": 1, D: 1 };
  const WEDGES = { LW: 1, SW: 1, W: 1, GW: 1, AW: 1, PW: 1 };

  let MODEL = null, ANALYSIS = null;        // 目前顯示的模型（依場次選擇）
  let MODE = "both";
  let BENCH = "hcp20";
  let TAB = "data";
  let PLAYERS = [];
  let curPlayer = null;
  let LOADED = [];                          // 該球員每一場 {meta, shots, model, analysis}
  let ALLMODEL = null, ALLANALYSIS = null;  // 全部場次合計
  let curSel = "all";
  let CURMETA = {};

  init();

  async function init() {
    try {
      if (!document.querySelector("#player-select") || !document.querySelector("#tabs")) {
        return showState("頁面版本不一致：偵測到舊版 <b>index.html</b>。請把最新的 <b>index.html</b> 與 <b>app.js</b> 一起上傳到 GitHub（兩個檔必須同一版）。");
      }
      bindToggle();
      bindBench();
      bindTabs();
      const manifest = await fetchJSON("./data/manifest.json");
      PLAYERS = (manifest.players || []).filter((p) => (p.sessions || []).length);
      if (!PLAYERS.length) return showState("manifest 裡沒有任何球員/場次。在 <b>data/manifest.json</b> 加一筆，並把 CSV 放進 <b>data/</b>。");
      const psel = document.querySelector("#player-select");
      psel.innerHTML = PLAYERS.map((p, i) => '<option value="' + i + '">' + esc(p.name || p.id) + (p.handicap ? "（差點 " + esc(p.handicap) + "）" : "") + "</option>").join("");
      psel.addEventListener("change", () => loadPlayer(PLAYERS[+psel.value]));
      const ssel = document.querySelector("#session-select");
      ssel.addEventListener("change", () => { curSel = ssel.value === "all" ? "all" : +ssel.value; render(); });
      await loadPlayer(PLAYERS[0]);
    } catch (e) {
      showState(
        "讀不到 <b>data/manifest.json</b>。<br>這個版本需要用 <b>HTTP 伺服器</b>開啟（雙擊本機檔案不行，瀏覽器會擋）。<br>" +
          "本機測試：在資料夾執行 <b>python3 -m http.server</b> 再開 localhost；正式則發佈到 <b>GitHub Pages</b>。<br><small>" +
          esc(String(e && e.message || e)) + "</small>"
      );
    }
  }

  async function loadPlayer(p) {
    curPlayer = p;
    showState("讀取中…");
    const loaded = [];
    await Promise.all((p.sessions || []).map(async (s) => {
      try {
        const text = await fetchText("./data/" + s.file);
        const shots = parseCSV(text);
        if (shots.length) loaded.push({ meta: s, shots: shots, model: buildModel(shots), analysis: null });
      } catch (e) { /* 略過讀不到的場次 */ }
    }));
    if (!loaded.length) return showState("這位球員的場次都讀不到（確認 <b>data/</b> 下的 CSV 與 manifest 路徑）。");
    loaded.sort((a, b) => String(b.meta.date || "").localeCompare(String(a.meta.date || "")));
    loaded.forEach((L) => { L.analysis = analyze(L.model); });
    LOADED = loaded;
    const allShots = loaded.reduce((acc, L) => acc.concat(L.shots), []);
    ALLMODEL = buildModel(allShots);
    ALLANALYSIS = analyze(ALLMODEL);
    const ssel = document.querySelector("#session-select");
    ssel.innerHTML = ['<option value="all">全部場次（合計 ' + loaded.length + " 場）</option>"]
      .concat(loaded.map((L, i) => '<option value="' + i + '">' + esc(L.meta.date || "") + (L.meta.label ? " · " + esc(L.meta.label) : "") + "</option>"))
      .join("");
    curSel = loaded.length > 1 ? "all" : 0;
    ssel.value = String(curSel);
    document.querySelector("#state").style.display = "none";
    document.querySelector("#dash").style.display = "block";
    render();
  }

  function setCurrent() {
    if (curSel === "all") {
      MODEL = ALLMODEL; ANALYSIS = ALLANALYSIS;
      CURMETA = { label: "全部場次", date: "", equipment: ((curPlayer.sessions || [])[0] || {}).equipment || "", device: "", note: "合計 " + LOADED.length + " 場" };
    } else {
      const L = LOADED[curSel]; MODEL = L.model; ANALYSIS = L.analysis; CURMETA = L.meta;
    }
  }

  function bindTabs() {
    document.querySelectorAll("#tabs .tab-button").forEach((b) => { b.onclick = function () { setTab(b.dataset.tab); }; });
  }
  function setTab(t) {
    TAB = t;
    document.querySelectorAll("#tabs .tab-button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    document.querySelectorAll(".view-panel").forEach((p) => p.classList.toggle("on", p.dataset.panel === t));
  }

  function render() {
    setCurrent();
    renderHeader();
    renderKpis(MODEL);
    drawLadder();
    renderScatter(MODEL);
    renderCross();
    renderCards(MODEL);
    renderDistTable(MODEL);
    renderFlags(ANALYSIS.findings);
    renderTakeaways(ANALYSIS.takeaways);
    renderPro();
    renderFoot(MODEL);
    setTab(TAB);
  }

  function renderHeader() {
    const M = MODEL;
    document.querySelector("#h-title").textContent = (curPlayer.name || curPlayer.id || "") + (curSel === "all" ? " · 全部場次" : (CURMETA.label ? " · " + CURMETA.label : (CURMETA.date ? " · " + CURMETA.date : "")));
    document.querySelector("#h-sub").textContent = (CURMETA.equipment || "") + (CURMETA.equipment && CURMETA.date ? " — " : "") + (curSel === "all" ? "" : (CURMETA.date || ""));
    document.querySelector("#sel-meta").textContent = (CURMETA.device ? "裝置 " + CURMETA.device + " · " : "") + (CURMETA.note || "");
    document.querySelector("#m-shots").textContent = M.totals.shots;
    document.querySelector("#m-used").textContent = M.totals.used;
    document.querySelector("#m-clubs").textContent = M.order.length;
    document.querySelector("#m-mis").textContent = Math.round(100 * (1 - M.totals.used / M.totals.shots)) + "%";
  }

  function renderCross() {
    const el = document.querySelector("#cross");
    if (!el) return;
    let h = '<table class="dtable"><thead><tr><th>場次</th><th>球數</th><th>可用</th><th>失誤率</th><th>最遠桿總距</th><th>7i 落點</th></tr></thead><tbody>';
    LOADED.forEach((L) => {
      const m = L.model, lead = m.clubs.D ? "D" : m.order[m.order.length - 1], seven = m.clubs["7i"];
      h += "<tr><td>" + esc(L.meta.date || "") + (L.meta.label ? " " + esc(L.meta.label) : "") + "</td><td>" + m.totals.shots + "</td><td>" + m.totals.used + "</td><td>" + Math.round(100 * (1 - m.totals.used / m.totals.shots)) + "%</td><td>" + (m.clubs[lead] ? m.clubs[lead].total : "—") + "</td><td>" + (seven ? seven.carry : "—") + "</td></tr>";
    });
    h += "</tbody></table>";
    el.innerHTML = '<div class="tablewrap">' + h + "</div>" +
      (LOADED.length < 2 ? '<div class="note">目前只有 1 場；多打幾場後這裡會顯示跨場趨勢（距離 / 失誤率 / 方向的變化）。</div>' : '<div class="note">每一列是一場，看跨場的距離與失誤率趨勢。</div>');
  }

  function renderDistTable(M) {
    const C = M.clubs;
    let h = '<table class="dtable"><thead><tr><th>球桿</th><th>落點</th><th>總距離</th><th>範圍</th><th>球速</th><th>出球角</th><th>失誤率</th></tr></thead><tbody>';
    M.order.forEach((c) => {
      const o = C[c];
      h += "<tr><td>" + c + "</td><td>" + o.carry + "</td><td>" + o.total + "</td><td>" + o.carry_min + "–" + o.carry_max + "</td><td>" + o.bs + "</td><td>" + o.launch + "°</td><td>" + o.mishit_rate + "%</td></tr>";
    });
    h += "</tbody></table>";
    document.querySelector("#disttable").innerHTML = '<div class="tablewrap">' + h + "</div>";
  }

  // ---------- CSV ----------
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
    if (lines.length < 2) return [];
    const head = splitCSVLine(lines[0]).map((h) => h.trim());
    const ix = (name) => head.indexOf(name);
    const iClub = ix("球桿");
    const iCarry = ix("無坡落點距離-比賽球(碼)");
    const iTotal = ix("無坡總距離-比賽球(碼)");
    const iApex = ix("最高點 (英尺)");
    const iBs = ix("球速(mph)");
    const iLaunch = ix("出球角度(度)");
    const iOff = ix("偏移");
    const iShot = ix("Shot #");
    if (iClub < 0 || iCarry < 0 || iTotal < 0) return [];
    const out = [];
    for (let k = 1; k < lines.length; k++) {
      const c = splitCSVLine(lines[k]);
      const club = relabel((c[iClub] || "").trim());
      if (!club) continue;
      const carry = num(c[iCarry]);
      const total = num(c[iTotal]);
      if (carry == null && total == null) continue;
      out.push({
        shot: int(c[iShot]) || k,
        club,
        carry: carry == null ? 0 : carry,
        total: total == null ? 0 : total,
        apex: iApex >= 0 ? num(c[iApex]) : null,
        ballSpeed: iBs >= 0 ? (num(c[iBs]) || 0) : 0,
        launch: iLaunch >= 0 ? num(c[iLaunch]) : null,
        offset: iOff >= 0 ? parseOff(c[iOff]) : 0,
      });
    }
    return out;
  }
  function splitCSVLine(line) {
    // 本資料無引號逗號；簡單切分即可，仍保險處理引號
    if (line.indexOf('"') < 0) return line.split(",");
    const res = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { res.push(cur); cur = ""; }
      else cur += ch;
    }
    res.push(cur);
    return res;
  }
  function relabel(c) { return c === "SW" ? "W" : c; }
  function num(v) {
    if (v == null) return null;
    v = String(v).replace("°", "").trim();
    if (v === "" || v === "--") return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
  }
  function int(v) { const n = parseInt(v, 10); return isFinite(n) ? n : 0; }
  function parseOff(v) {
    v = (v || "").trim();
    if (!v || v === "--" || v === "0") return 0;
    const s = v.slice(-1), a = Number(v.slice(0, -1));
    if (!isFinite(a)) return 0;
    return s === "L" ? -a : s === "R" ? a : 0;
  }

  // ---------- 模型聚合 ----------
  function buildModel(shots) {
    const byClub = groupBy(shots, (s) => s.club);
    const clubs = {};
    Object.keys(byClub).forEach((club) => {
      const arr = byClub[club];
      const mC = median(arr.map((s) => s.carry));
      const mS = median(arr.map((s) => s.ballSpeed));
      const mT = median(arr.map((s) => s.total));
      const isOut = (s) =>
        (mC > 0 && s.carry < mC * 0.75) ||
        (mS > 0 && s.ballSpeed > 0 && s.ballSpeed < mS * 0.75) ||
        (s.launch != null && s.launch <= 5) ||
        (s.apex != null && s.apex <= 2) ||
        (club === "D" && s.launch != null && s.launch >= 24 && s.total < mT * 0.8);
      arr.forEach((s) => (s._out = !!isOut(s)));
      let used = arr.filter((s) => !s._out);
      if (!used.length) used = arr;
      const carr = used.map((s) => s.carry);
      const tot = used.map((s) => s.total);
      const offs = used.map((s) => s.offset);
      clubs[club] = {
        n_total: arr.length,
        n_used: used.length,
        mishit_rate: Math.round((100 * (arr.length - used.length)) / arr.length),
        carry: Math.round(median(carr)),
        total: Math.round(median(tot)),
        carry_min: Math.round(Math.min.apply(null, carr)),
        carry_max: Math.round(Math.max.apply(null, carr)),
        total_min: Math.round(Math.min.apply(null, tot)),
        total_max: Math.round(Math.max.apply(null, tot)),
        total_std: r1(std(tot)),
        bs: r1(mean(used.map((s) => s.ballSpeed))),
        launch: Math.round(median(used.map((s) => s.launch).filter(isFinite))),
        apex: Math.round(median(used.map((s) => s.apex).filter((x) => x != null))),
        off_mean: r1(mean(offs)),
        off_std: r1(std(offs)),
        n_left: offs.filter((o) => o < 0).length,
        n_right: offs.filter((o) => o > 0).length,
        n_center: offs.filter((o) => o === 0).length,
      };
    });
    const order = BAG_ORDER.filter((c) => clubs[c]);
    Object.keys(clubs).forEach((c) => { if (order.indexOf(c) < 0) order.push(c); });
    const driver = (byClub.D || []).map((s) => ({ total: s.total, off: s.offset, launch: s.launch, bs: s.ballSpeed, keep: !s._out }));
    const used = order.reduce((a, c) => a + clubs[c].n_used, 0);
    return { clubs, order, driver, totals: { shots: shots.length, used } };
  }

  // ---------- 自動分析 ----------
  function isIron(c) { return /^\d+i$/.test(c) || WEDGES[c]; }
  function analyze(M) {
    const C = M.clubs, order = M.order, F = [];
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i], b = order[i + 1], A = C[a], B = C[b], g = B.carry - A.carry;
      const bothIron = isIron(a) && isIron(b);
      if (bothIron && g <= -5) F.push({ sev: 2, pill: "反序", t: b + " 落點低於 " + a, b: b + " " + B.carry + " 碼 < " + a + " " + A.carry + " 碼（差 " + Math.abs(g) + " 碼）。單場樣本容易被幾顆球拉動，先確認 " + b + " 是否沒打順或樣本太少。" });
      else if (bothIron && Math.abs(g) < 5) F.push({ sev: 1, pill: "重疊", t: a + "↔" + b + " 距離未拉開", b: "落點僅差 " + g + " 碼，兩支桿幾乎同距離，選桿會猶豫；新桿適應期常見，多打幾場再定案。" });
      if (g >= 25) F.push({ sev: 2, pill: "缺口", t: a + "→" + b + " 有 " + g + " 碼大缺口", b: "中間可能缺一支桿或某桿距離異常；" + Math.round((A.carry + B.carry) / 2) + " 碼附近沒有穩定打法。" });
    }
    const rights = [], lefts = [];
    order.forEach((c) => {
      if (!isIron(c)) return;
      const o = C[c], n = o.n_left + o.n_right + o.n_center;
      if (n >= 4 && o.n_right >= o.n_left * 2 && o.off_mean >= 1.5) rights.push(c);
      else if (n >= 4 && o.n_left >= o.n_right * 2 && o.off_mean <= -1.5) lefts.push(c);
    });
    if (rights.length >= 2) F.push({ sev: 3, pill: "方向", t: "鐵桿系統性右偏", b: rights.join("、") + " 多數偏右（非隨機）→ 站位/瞄準/桿面方向。這是最快回收桿數的地方。" });
    if (lefts.length >= 2) F.push({ sev: 3, pill: "方向", t: "鐵桿系統性左偏", b: lefts.join("、") + " 多數偏左（非隨機）→ 檢查站位與桿面。" });
    order.forEach((c) => {
      const o = C[c];
      if (o.n_total >= 5 && o.mishit_rate >= 40) F.push({ sev: 1, pill: "穩定性", t: c + " 失誤率偏高 " + o.mishit_rate + "%", b: o.n_used + "/" + o.n_total + " 為穩定球，先把擊球一致性練起來再談距離。" });
    });
    if (C.D) {
      const d = C.D, spread = d.total_max - d.total_min;
      F.push({ sev: spread > 70 ? 2 : 0, pill: "Driver", t: "一號木總結", b: "方向 " + d.n_left + "L:" + d.n_right + "R（平均 " + fmtOff(d.off_mean) + "）、球速 " + d.bs + " mph；總距離 " + d.total_min + "–" + d.total_max + " 碼、離散 std " + d.total_std + "。" + (spread > 70 ? "散佈偏大，一致性是下一步。" : "散佈尚可。") });
    }
    let best = null;
    order.forEach((c) => { const o = C[c]; if (o.n_total >= 6 && o.total_std < 10 && o.mishit_rate <= 20) { if (!best || o.total_std < C[best].total_std) best = c; } });
    if (best) F.push({ sev: 0, pill: "亮點", t: best + " 最穩定", b: "離散小（std " + C[best].total_std + "）、失誤率 " + C[best].mishit_rate + "%，可作為距離基準桿。" });
    F.sort((a, b) => b.sev - a.sev);

    const T = [];
    F.forEach((f) => {
      if (T.length >= 5 || f.sev < 1) return;
      T.push({ p: f.sev >= 3 ? 1 : 2, t: action(f), b: f.b });
    });
    if (!T.length) T.push({ p: 2, t: "先累積資料量", b: "目前可分析的訊號不多，多打幾場累積穩定球，分析會更準。" });
    return { findings: F, takeaways: T };
  }
  function action(f) {
    switch (f.pill) {
      case "方向": return "先處理方向偏差（瞄準 / 站位 / 桿面）";
      case "反序": return "確認「" + f.t + "」是樣本問題還是真的弱";
      case "缺口": return "評估補桿或調整打法填「" + f.t + "」";
      case "重疊": return "破桿期先別急著調 gapping（" + f.t + "）";
      case "gapping": return "破桿期先別急著調 gapping（" + f.t + "）";
      case "穩定性": return "先練一致性：" + f.t;
      case "Driver": return "Driver：練一致性與出球角控制";
      default: return f.t;
    }
  }

  // ---------- 渲染 ----------
  function renderKpis(M) {
    const C = M.clubs, lead = M.order[M.order.length - 1];
    const o = C[lead];
    const kpis = [
      { v: o.total, u: "碼", l: lead + " 平均總距離" },
      { v: o.total_max, u: "碼", l: lead + " 單球最遠" },
      { v: o.bs, u: "mph", l: lead + " 平均球速" },
      { v: o.n_left + ":" + o.n_right, u: "L:R", l: lead + " 方向（穩定球）" },
    ];
    document.querySelector("#kpis").innerHTML = kpis
      .map((k) => '<div class="kpi"><div class="v num">' + k.v + "<small> " + k.u + "</small></div><div class=\"l\">" + k.l + "</div></div>")
      .join("");
    document.querySelector("#scatter-title").textContent = lead + " 深入分析";
  }

  function drawLadder() {
    const M = MODEL, C = M.clubs, order = M.order;
    const B = BENCHMARKS[BENCH] || BENCHMARKS.none;
    const benchVals = order.map((c) => B.clubs[c]).filter((v) => v);
    const maxTotal = Math.max.apply(null, order.map((c) => C[c].total).concat(benchVals));
    const MAX = Math.max(40, Math.ceil(maxTotal / 40) * 40);
    let html = "";
    order.forEach((c, i) => {
      const o = C[c];
      const carryW = clamp((o.carry / MAX) * 100, 1, 100);
      const totalW = clamp((o.total / MAX) * 100, 1, 100);
      const isW = WOODS[c] ? " wood" : "";
      let bars;
      if (MODE === "carry") bars = '<div class="bar carry" style="width:' + carryW + '%"></div>';
      else if (MODE === "total") bars = '<div class="bar carry" style="width:' + totalW + '%"></div>';
      else bars = '<div class="bar roll" style="width:' + totalW + '%"></div><div class="bar carry" style="width:' + carryW + '%"></div>';
      const dist =
        MODE === "carry" ? '<span class="num">' + o.carry + "</span>"
          : MODE === "total" ? '<span class="num">' + o.total + "</span>"
            : '<span class="num">' + o.carry + '</span> <span class="t num">/ ' + o.total + "</span>";
      const bv = B.clubs[c];
      let marker = "", benchTxt = "";
      if (bv) {
        marker = '<span class="bench-marker" style="left:' + clamp((bv / MAX) * 100, 1, 100) + '%"></span>';
        const own = B.metric === "carry" ? o.carry : o.total;
        const d = own - bv;
        benchTxt = '<span class="bench ' + (d >= 0 ? "up" : "down") + '">基準 ' + bv + " · " + (d >= 0 ? "+" : "") + d + "</span>";
      }
      html += '<div class="row"><div class="club' + isW + '">' + c + '</div><div class="track">' + bars + marker + '</div><div class="dist">' + dist + benchTxt + "</div></div>";
      if (i < order.length - 1) {
        const b = order[i + 1], g = C[b].carry - o.carry, iron = isIron(c) && isIron(b);
        if (iron && g <= -5) html += '<div class="gapchip gap-hole">⚠ ' + b + " 比 " + c + " 短 " + Math.abs(g) + " 碼 — 反序</div>";
        else if (iron && Math.abs(g) < 5) html += '<div class="gapchip gap-over">↕ ' + c + "↔" + b + " 未拉開（差 " + g + " 碼）</div>";
        else if (g >= 25) html += '<div class="gapchip gap-hole">⚠ 到 ' + b + " 有 " + g + " 碼大缺口</div>";
      }
    });
    const q = MAX / 4;
    html += '<div class="scale num"><span>0</span><span>' + Math.round(q) + "</span><span>" + Math.round(q * 2) + "</span><span>" + Math.round(q * 3) + "</span><span>" + MAX + " 碼</span></div>";
    document.querySelector("#ladder").innerHTML = html;
    const sub = document.querySelector("#bench-sub");
    if (sub) sub.innerHTML = BENCH === "none" ? "" : "紅線＝" + B.label + "（比" + (B.metric === "carry" ? "落點" : "總距離") + "）· +高於基準 / −低於基準";
  }
  function bindToggle() {
    document.querySelectorAll("#tg button").forEach((b) => {
      b.onclick = function () {
        document.querySelectorAll("#tg button").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        MODE = b.dataset.m;
        if (MODEL) drawLadder();
      };
    });
  }
  function bindBench() {
    const sel = document.querySelector("#bench-select");
    if (!sel) return;
    sel.innerHTML = Object.keys(BENCHMARKS)
      .map((k) => '<option value="' + k + '">' + BENCHMARKS[k].label + "</option>")
      .join("");
    sel.value = BENCH;
    sel.addEventListener("change", function () { BENCH = sel.value; if (MODEL) drawLadder(); });
  }

  function renderFlags(F) {
    if (!F.length) { document.querySelector("#flags").innerHTML = '<div class="flag"><div class="ft">沒有明顯異常訊號</div><div class="fb">本場距離梯、方向、失誤率都在合理範圍。</div></div>'; return; }
    document.querySelector("#flags").innerHTML = F
      .map((f) => '<div class="flag ' + (f.sev >= 2 ? "crit" : "") + '"><div class="ft"><span class="pill">' + f.pill + "</span>" + f.t + '</div><div class="fb">' + f.b + "</div></div>")
      .join("");
  }

  function renderCards(M) {
    const C = M.clubs;
    document.querySelector("#cards").innerHTML = M.order
      .slice()
      .reverse()
      .map((c) => {
        const o = C[c], isW = WOODS[c] ? " wood" : "";
        return (
          '<div class="cc"><div class="cc-top"><div class="cc-club' + isW + '">' + c + '</div><div class="cc-n">採用 ' + o.n_used + "/" + o.n_total + "<br>失誤率 " + o.mishit_rate + '%</div></div>' +
          '<div class="cc-main"><span class="big num">' + o.carry + '</span><span class="unit">碼 落點</span></div>' +
          '<div class="cc-sub">總距離 ' + o.total + " 碼 · 範圍 " + o.carry_min + "–" + o.carry_max + '</div>' +
          '<div class="cc-grid"><div>球速<b class="num">' + o.bs + ' mph</b></div><div>出球角<b class="num">' + o.launch + '°</b></div><div>最高點<b class="num">' + o.apex + ' ft</b></div><div>一致性<b>' + consist(o.total_std) + "</b></div></div>" +
          dispCard(o) + "</div>"
        );
      })
      .join("");
  }
  function consist(s) { return s == null ? "—" : s < 8 ? "穩定" : s < 13 ? "普通" : "偏散"; }
  function dispCard(o) {
    const span = 12, toX = (v) => 50 + Math.max(-1, Math.min(1, v / span)) * 50;
    const mean0 = o.off_mean || 0, lo = mean0 - (o.off_std || 0), hi = mean0 + (o.off_std || 0);
    const col = mean0 > 0.5 ? "var(--rt)" : mean0 < -0.5 ? "var(--lt)" : "var(--success)";
    const n = o.n_left + o.n_right + o.n_center;
    const dir = o.n_right > o.n_left * 1.5 ? "偏右 " + o.n_right + "/" + n : o.n_left > o.n_right * 1.5 ? "偏左 " + o.n_left + "/" + n : "方向均衡";
    return '<div class="disp"><div class="disp-lab"><span>左</span><span style="color:' + col + '">' + dir + '</span><span>右</span></div>' +
      '<div class="disp-track"><div class="disp-mid"></div><div class="disp-rng" style="left:' + Math.min(toX(lo), toX(hi)) + "%;width:" + Math.abs(toX(hi) - toX(lo)) + "%;background:" + col + '"></div><div class="disp-dot" style="left:' + toX(mean0) + "%;background:" + col + '"></div></div></div>';
  }

  function renderScatter(M) {
    const pts = M.driver;
    const svg = document.querySelector("#dsvg");
    if (!pts.length) { svg.innerHTML = '<text x="180" y="120" text-anchor="middle" fill="#8a96a8" font-size="12" font-family="IBM Plex Mono">本場沒有一號木資料</text>'; return; }
    const W = 360, H = 240, padL = 40, padR = 14, padT = 16, padB = 30;
    const xs = pts.map((d) => d.total);
    const xmin = Math.min.apply(null, xs) - 8, xmax = Math.max.apply(null, xs) + 8;
    const offMax = Math.max(10, Math.max.apply(null, pts.map((d) => Math.abs(d.off || 0))) + 2);
    const X = (v) => padL + ((v - xmin) / (xmax - xmin)) * (W - padL - padR);
    const Y = (o) => padT + ((offMax - o) / (2 * offMax)) * (H - padT - padB);
    let s = "";
    s += '<line x1="' + padL + '" y1="' + Y(0) + '" x2="' + (W - padR) + '" y2="' + Y(0) + '" stroke="rgba(0,0,242,.38)" stroke-width="1"/>';
    s += '<text x="' + (W - padR) + '" y="' + (Y(0) - 4) + '" fill="#8a96a8" font-size="9" text-anchor="end" font-family="IBM Plex Mono">目標線</text>';
    for (let t = Math.ceil(xmin / 40) * 40; t <= xmax; t += 40) {
      s += '<line x1="' + X(t) + '" y1="' + padT + '" x2="' + X(t) + '" y2="' + (H - padB) + '" stroke="rgba(8,42,92,.10)" stroke-width="1"/>';
      s += '<text x="' + X(t) + '" y="' + (H - padB + 14) + '" fill="#8a96a8" font-size="9" text-anchor="middle" font-family="IBM Plex Mono">' + t + "</text>";
    }
    s += '<text x="' + W / 2 + '" y="' + (H - 4) + '" fill="#5e6b7d" font-size="9.5" text-anchor="middle" font-family="IBM Plex Mono">總距離 (碼)</text>';
    s += '<text x="10" y="' + Y(offMax * 0.7) + '" fill="#164dff" font-size="9" font-family="IBM Plex Mono">左</text>';
    s += '<text x="10" y="' + (Y(-offMax * 0.7) + 3) + '" fill="#e8654f" font-size="9" font-family="IBM Plex Mono">右</text>';
    pts.forEach((d) => {
      const col = d.keep ? "#164dff" : "#ff5c7a";
      const oc = d.off > 0 ? "#e8654f" : d.off < 0 ? "#164dff" : "#9fb3c8";
      s += '<circle cx="' + X(d.total) + '" cy="' + Y(d.off) + '" r="' + (d.keep ? 4.2 : 3.4) + '" fill="' + col + '" fill-opacity="' + (d.keep ? 0.85 : 0.5) + '" stroke="' + oc + '" stroke-width="1.1"></circle>';
    });
    svg.innerHTML = s;
  }

  function renderTakeaways(T) {
    document.querySelector("#take").innerHTML = T
      .map((t) => '<div class="tk ' + (t.p === 1 ? "p1" : "") + '"><div class="tt">' + t.t + '</div><div class="tb">' + t.b + "</div></div>")
      .join("");
  }

  function renderPro() {
    const f = (v) => (v ? "" + v : "—");
    const rows = PRO.map((p) => '<tr><td class="num">' + p.r + "</td><td>" + p.zh + ' <span style="color:var(--muted2);font-size:10.5px">' + p.en + " · " + p.c + '</span></td><td class="num">' + f(p.dd) + '</td><td class="num">' + f(p.bs) + '</td><td class="num">' + f(p.cs) + '</td><td class="num">' + f(p.sm) + '</td><td style="white-space:normal;color:var(--muted);font-size:11.5px">' + p.note + "</td></tr>").join("");
    const lead = MODEL.clubs.D || MODEL.clubs[MODEL.order[MODEL.order.length - 1]];
    document.querySelector("#pro").innerHTML =
      '<div class="pro-wrap"><table><thead><tr><th>#</th><th>選手</th><th>開球(碼)</th><th>球速</th><th>桿速</th><th>smash</th><th>招牌強項</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div style="margin-top:11px;color:var(--muted);font-size:11.5px;line-height:1.65">📊 <b style="color:var(--ink)">對標</b>：名人開球約 290–320 碼、球速 ~177 mph；你最長桿總距離 <b style="color:var(--ink)">' + lead.total + ' 碼</b>、球速 <b style="color:var(--ink)">' + lead.bs + ' mph</b>。距離靠天生＋揮速，<b style="color:var(--ink)">方向與短桿才是最快追上桿數的地方</b>。來源：OWGR / PGA Tour 官方統計、TrackMan 等。</div>';
  }

  function renderFoot(M) {
    document.querySelector("#foot").innerHTML =
      "方法：以「無坡 · 比賽球」為主數據。穩定球過濾＝落點/球速低於該桿中位數 75%、或出球角≤5°、或最高點≤2ft（一號木另含沖天炮規則）視為失誤球，只用穩定球算平均與 gapping。本場 " +
      M.totals.shots + " 球，採用 " + M.totals.used + " 球。<br><b>球桿標籤：</b>原始 CSV 的 <b>SW</b> 自動正名為 <b>W（T250 48°）</b>。資料即時由 CSV 計算，數字會隨資料更新。";
  }

  // ---------- utils ----------
  function showState(html) {
    const el = document.querySelector("#state");
    el.innerHTML = html;
    el.style.display = "block";
    document.querySelector("#dash").style.display = "none";
  }
  async function fetchJSON(u) { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }
  async function fetchText(u) { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }
  function groupBy(list, fn) { const m = {}; list.forEach((x) => { const k = fn(x); (m[k] = m[k] || []).push(x); }); return m; }
  function median(a) { const s = a.filter(isFinite).slice().sort((x, y) => x - y); if (!s.length) return 0; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function mean(a) { const n = a.filter(isFinite); return n.length ? n.reduce((x, y) => x + y, 0) / n.length : 0; }
  function std(a) { const n = a.filter(isFinite); if (n.length < 2) return 0; const m = mean(n); return Math.sqrt(mean(n.map((x) => (x - m) * (x - m)))); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fmtOff(v) { const r = Math.round(v * 10) / 10; return r === 0 ? "0" : Math.abs(r) + (r < 0 ? "L" : "R"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
})();
