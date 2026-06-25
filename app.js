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
  const PLAYER_AVATARS = {
    tony: { hair: "sweep", face: "long", seed: 0 },
    renwen: { hair: "short", face: "round", seed: 1 },
    dondon: { hair: "cap", face: "wide", seed: 2 },
    ann: { hair: "bob", face: "soft", seed: 3 },
    yoyo: { hair: "pony", face: "soft", seed: 4 },
    kelly: { hair: "wave", face: "round", seed: 5 },
  };

  // 球袋順序（短→長），未列到的球桿會自動接在後面
  const BAG_ORDER = ["LW", "SW", "W", "GW", "AW", "PW", "9i", "8i", "7i", "6i", "5i", "4i", "3i", "2i", "6H", "5H", "4H", "3H", "2H", "9W", "7W", "5W", "4W", "3W", "2W", "D"];
  const WOODS = { "2H": 1, "3H": 1, "4H": 1, "5H": 1, "6H": 1, "2W": 1, "3W": 1, "4W": 1, "5W": 1, "7W": 1, "9W": 1, D: 1 };
  const WEDGES = { LW: 1, SW: 1, W: 1, GW: 1, AW: 1, PW: 1 };
  const LAUNCH_REFERENCES = {
    D: { low: 10, high: 16, target: 13.5, note: "Driver 優化區間" },
    "2W": { low: 8, high: 13 }, "3W": { low: 9, high: 14 }, "4W": { low: 10, high: 15 }, "5W": { low: 11, high: 16 }, "7W": { low: 12, high: 18 }, "9W": { low: 14, high: 20 },
    "2H": { low: 9, high: 15 }, "3H": { low: 10, high: 16 }, "4H": { low: 12, high: 18 }, "5H": { low: 14, high: 20 }, "6H": { low: 16, high: 22 },
    "2i": { low: 10, high: 16 }, "3i": { low: 11, high: 17 }, "4i": { low: 12, high: 18 }, "5i": { low: 14, high: 19 }, "6i": { low: 15, high: 20, target: 17 },
    "7i": { low: 17, high: 23 }, "8i": { low: 19, high: 25 }, "9i": { low: 21, high: 27 },
    PW: { low: 23, high: 30, target: 27 }, AW: { low: 24, high: 31 }, GW: { low: 25, high: 32 }, W: { low: 25, high: 32 }, SW: { low: 27, high: 35 }, LW: { low: 29, high: 38 },
  };
  const CLUB_TREND_WINDOW = 5;
  const DONGHUA_OLD_HOLE_MAPS = { 3: 1, 6: 1, 10: 1, 12: 1, 17: 1, 18: 1 };
  const DONGHUA_YARDS = {
    1: { blue: 562, white: 546, red: 478 },
    2: { blue: 432, white: 398, red: 338 },
    3: { blue: 187, white: 167, red: 137 },
    4: { blue: 398, white: 372, red: 306 },
    5: { blue: 418, white: 387, red: 349 },
    6: { blue: 226, white: 204, red: 182 },
    7: { blue: 442, white: 397, red: 353 },
    8: { blue: 515, white: 493, red: 450 },
    9: { blue: 427, white: 403, red: 323 },
    10: { blue: 432, white: 414, red: 363 },
    11: { blue: 401, white: 372, red: 328 },
    12: { blue: 545, white: 515, red: 472 },
    13: { blue: 189, white: 179, red: 152 },
    14: { blue: 410, white: 383, red: 323 },
    15: { blue: 407, white: 387, red: 316 },
    16: { blue: 199, white: 161, red: 132 },
    17: { blue: 567, white: 531, red: 487 },
    18: { blue: 428, white: 378, red: 324 },
  };

  let MODEL = null, ANALYSIS = null;        // 目前顯示的模型（依場次選擇）
  let MODE = "both";
  let BENCH = "hcp20";
  let DEEP_CLUB = "all";
  let TAB = "data";
  let EVENT_INDEX = 0;
  let AVATAR_STYLE = readAvatarStyle();
  let PLAYERS = [];
  let COACH_RULES = { rules: [], fallbackPractice: [] };
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
      bindAvatarStyle();
      const manifest = await fetchJSON("./data/manifest.json");
      await hydrateTargetEvents(manifest);
      COACH_RULES = await loadCoachRules();
      PLAYERS = manifest.players || [];
      if (!PLAYERS.length) return showState("manifest 裡沒有任何球員。在 <b>data/manifest.json</b> 加一筆，並把 CSV 放進 <b>data/</b>。");
      const psel = document.querySelector("#player-select");
      psel.innerHTML = PLAYERS.map((p, i) => '<option value="' + i + '">' + esc(p.name || p.id) + (p.handicap ? "（差點 " + esc(p.handicap) + "）" : "") + "</option>").join("");
      psel.addEventListener("change", () => loadPlayer(PLAYERS[+psel.value]));
      const ssel = document.querySelector("#session-select");
      ssel.addEventListener("change", () => { curSel = ssel.value === "all" ? "all" : +ssel.value; render(); });
      renderPlayerProfile(PLAYERS[0], []);
      await loadPlayer(PLAYERS[0]);
    } catch (e) {
      showState(
        "讀不到 <b>data/manifest.json</b>。<br>這個版本需要用 <b>HTTP 伺服器</b>開啟（雙擊本機檔案不行，瀏覽器會擋）。<br>" +
          "本機測試：在資料夾執行 <b>python3 -m http.server</b> 再開 localhost；正式則發佈到 <b>GitHub Pages</b>。<br><small>" +
          esc(String(e && e.message || e)) + "</small>"
      );
    }
  }

  async function hydrateTargetEvents(manifest) {
    const players = manifest.players || [];
    await Promise.all(players.map(async (p) => {
      const files = p.targetEventFiles || [];
      if (!files.length) return;
      const loaded = [];
      for (const file of files) {
        try {
          const data = await fetchJSON("./data/" + file);
          if (Array.isArray(data)) loaded.push.apply(loaded, data);
          else if (data) loaded.push(data);
        } catch (e) {
          p.targetEventLoadError = "讀不到 " + file;
        }
      }
      p.targetEvents = (p.targetEvents || []).concat(loaded);
    }));
  }

  async function loadCoachRules() {
    try {
      const rules = await fetchJSON("./data/rules/coach_rules.json");
      return rules || { rules: [], fallbackPractice: [] };
    } catch (e) {
      return { rules: [], fallbackPractice: [] };
    }
  }

  async function loadPlayer(p) {
    curPlayer = p;
    EVENT_INDEX = 0;
    renderPlayerProfile(p, []);
    showState("讀取中…");
    const sessions = p.sessions || [];
    if (!sessions.length) {
      LOADED = [];
      ALLMODEL = null;
      ALLANALYSIS = null;
      MODEL = null;
      ANALYSIS = null;
      document.querySelector("#session-select").innerHTML = '<option value="">尚無場次</option>';
      document.querySelector("#sel-meta").textContent = "尚未匯入 CSV";
      renderPlayerProfile(p, []);
      return showState("這位球員目前還沒有 CSV 場次。把檔案放進 <b>data/" + esc(p.id || "") + "/</b>，並更新 <b>data/manifest.json</b> 後，就會顯示在這裡。");
    }
    const loaded = [];
    await Promise.all(sessions.map(async (s) => {
      try {
        const text = await fetchText("./data/" + s.file);
        const shots = parseCSV(text, s);
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
    renderPlayerProfile(p, loaded);
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
  function bindAvatarStyle() {
    const sel = document.querySelector("#avatar-style-select");
    if (!sel) return;
    sel.value = AVATAR_STYLE;
    sel.addEventListener("change", () => {
      AVATAR_STYLE = sel.value || "cute";
      saveAvatarStyle(AVATAR_STYLE);
      renderPlayerProfile(curPlayer, LOADED);
    });
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
    renderDeepSelector(MODEL);
    renderScatter(MODEL);
    renderCross();
    renderStabilityTrends();
    renderBagProfiles();
    renderActionCenter();
    renderLongCoach();
    renderCards(MODEL);
    renderDistTable(MODEL);
    renderFlags(ANALYSIS.findings);
    renderTakeaways(ANALYSIS.takeaways);
    renderPro();
    renderTargetEvents();
    renderFoot(MODEL);
    setTab(TAB);
  }

  function renderPlayerProfile(p, loaded) {
    if (!p || !document.querySelector("#player-avatar")) return;
    const sessions = p.sessions || [];
    const ready = loaded && loaded.length ? loaded : [];
    const latest = ready[0] ? ready[0].meta : sessions.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
    const status = ready.length
      ? ready.length + " 場 CSV · 最新 " + (latest && latest.date ? latest.date : "未標日期") + (latest && latest.device ? " · " + latest.device : "")
      : sessions.length
        ? sessions.length + " 場設定 · 載入中"
        : "尚未匯入 CSV · 等待第一次資料";
    document.querySelector("#player-avatar").innerHTML = playerAvatarHTML(p);
    document.querySelector("#player-name").textContent = p.name || p.id || "Player";
    document.querySelector("#player-hcp").textContent = p.handicap ? "HCP " + p.handicap : "HCP —";
    document.querySelector("#player-status").textContent = status;
  }

  function playerAvatarHTML(p) {
    const src = playerAvatarSrc(p);
    if (src) return '<img class="player-avatar-img" src="' + esc(src) + '" alt="' + esc(p.name || p.id || "球員") + ' 的似顏繪頭像">';
    return playerAvatarSvg(p);
  }

  function playerAvatarSrc(p) {
    const styles = p.avatarStyles || (p.profile && p.profile.avatarStyles) || {};
    return styles[AVATAR_STYLE] || styles.cute || p.avatar || p.avatarUrl || (p.profile && p.profile.avatar) || "";
  }

  function playerAvatarSvg(p) {
    const id = String(p.id || p.name || "").toLowerCase();
    const preset = PLAYER_AVATARS[id] || { hair: "short", face: "round", seed: id.length % 6 };
    const face = avatarFace(preset.face);
    return '<svg class="player-avatar" viewBox="0 0 96 96" role="img" aria-label="' + esc(p.name || p.id || "球員") + ' 頭像">' +
      '<circle cx="48" cy="48" r="43" fill="#ffd817"></circle>' +
      avatarHair(preset.hair, true) +
      '<path d="' + face + '" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"></path>' +
      '<path d="' + face + '" fill="#fff" stroke="#050505" stroke-width="3.8" stroke-linejoin="round"></path>' +
      avatarHair(preset.hair, false) +
      avatarFeatures(preset.seed || 0) +
      '</svg>';
  }

  function avatarFace(kind) {
    if (kind === "wide") return "M25 47 C26 31 39 22 55 25 C70 28 78 42 75 58 C72 73 58 81 43 78 C30 75 23 64 25 47 Z";
    if (kind === "soft") return "M27 45 C29 30 41 22 55 26 C70 30 76 45 72 61 C68 75 55 82 42 78 C30 74 24 61 27 45 Z";
    if (kind === "long") return "M28 42 C30 27 43 20 58 25 C73 30 78 46 73 63 C69 77 57 83 43 79 C31 75 24 63 26 49 C26 46 27 44 28 42 Z";
    return "M26 45 C28 30 41 22 56 26 C70 30 77 43 74 58 C71 73 58 81 43 78 C30 75 23 61 26 45 Z";
  }

  function avatarHair(kind, outline) {
    const stroke = outline ? ' stroke="#fff" stroke-width="9" stroke-linejoin="round"' : ' stroke="#050505" stroke-width="2" stroke-linejoin="round"';
    const fill = ' fill="#050505"';
    if (kind === "bob") return '<path d="M25 49 C23 34 34 21 51 21 C69 21 78 34 76 53 C72 45 64 38 54 35 C43 32 34 36 25 49 Z"' + fill + stroke + '></path><path d="M28 46 C23 57 27 69 37 76 C31 74 24 66 22 56 C20 48 22 42 28 36 Z"' + fill + stroke + '></path>';
    if (kind === "pony") return '<path d="M28 49 C27 33 39 21 55 24 C69 27 75 39 73 51 C63 40 49 37 32 44 Z"' + fill + stroke + '></path><path d="M70 42 C82 45 84 58 76 66 C78 56 72 52 66 50 Z"' + fill + stroke + '></path>';
    if (kind === "wave") return '<path d="M26 48 C25 33 38 21 53 22 C69 23 78 35 77 52 C70 43 62 38 52 37 C42 36 34 39 26 48 Z"' + fill + stroke + '></path><path d="M30 36 C38 27 49 25 60 31 C50 29 41 31 33 42 Z"' + fill + stroke + '></path>';
    if (kind === "cap") return '<path d="M27 39 C34 25 55 20 70 31 C60 32 45 34 28 44 Z"' + fill + stroke + '></path><path d="M58 30 C70 30 78 34 82 40 C73 40 66 39 58 36 Z"' + fill + stroke + '></path>';
    if (kind === "sweep") return '<path d="M27 47 C24 33 36 22 52 21 C70 20 79 34 76 52 C66 41 53 38 36 35 C42 40 50 42 60 42 C47 47 36 44 27 47 Z"' + fill + stroke + '></path>';
    return '<path d="M27 45 C28 30 41 22 56 24 C70 27 76 39 73 51 C62 41 49 37 31 42 Z"' + fill + stroke + '></path>';
  }

  function avatarFeatures(seed) {
    const smile = seed % 2 ? "M42 64 C48 69 57 68 63 62" : "M42 64 C49 68 57 68 63 63";
    const nose = seed % 3 ? "M57 44 C60 52 64 56 59 59" : "M56 44 C59 52 63 56 58 59";
    return '<circle cx="40" cy="47" r="3.5" fill="#050505"></circle>' +
      '<circle cx="59" cy="47" r="3.5" fill="#050505"></circle>' +
      '<path d="M36 40 C40 38 44 39 47 41" fill="none" stroke="#050505" stroke-width="3.4" stroke-linecap="round"></path>' +
      '<path d="M55 40 C60 38 64 39 67 42" fill="none" stroke="#050505" stroke-width="3.4" stroke-linecap="round"></path>' +
      '<path d="' + nose + '" fill="none" stroke="#050505" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '<path d="' + smile + '" fill="none" stroke="#050505" stroke-width="3.4" stroke-linecap="round"></path>';
  }

  function renderHeader() {
    const M = MODEL;
    renderPlayerProfile(curPlayer, LOADED);
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

  function renderStabilityTrends() {
    const el = document.querySelector("#stability");
    if (!el) return;
    const rows = LOADED.slice().reverse().map((L) => {
      const s = statFromModel(L.model);
      return { date: L.meta.date || "", label: L.meta.label || "", shots: s.shots, miss: s.miss, rate: s.rate, model: L.model };
    });
    if (rows.length < 2) {
      el.innerHTML = '<div class="statebox">目前場次不足，至少 2 場後才會顯示穩定性趨勢。</div>';
      return;
    }

    const latest = rollingRate(rows, rows.length - 1, 3);
    const prev = rollingRate(rows, rows.length - 2, 3);
    const overallTrend = trendInfo(latest.rate, prev.rate, rows.length >= 2);
    let h = '<div class="trend-guide"><div><b>排序</b>表格由最新日期排到最舊日期，先看最近狀態。</div><div><b>近三場</b>用失誤球數 / 總球數加權，不是單純平均百分比。</div><div><b>判讀</b>失誤率下降＝改善；上升＝退步；樣本不足不硬判。</div></div>';
    h += '<div class="trend-grid"><div class="trend-card"><div class="trend-top"><div><div class="trend-title">整體失誤率時間軸</div><div class="trend-meta">每場所有球桿合計；近三場以失誤球數 / 總球數加權。折線由舊到新，節點顯示單場失誤率。</div></div>' + trendPill(overallTrend) + '</div>';
    h += trendLineChart(rows);
    h += '<div class="tablewrap"><table class="dtable"><thead><tr><th>日期（新→舊）</th><th>球數</th><th>失誤</th><th>失誤率</th><th>近三場</th><th>趨勢</th></tr></thead><tbody>';
    rows.map((r, i) => ({ r, i })).reverse().forEach((item) => {
      const r = item.r, i = item.i;
      const roll = rollingRate(rows, i, 3);
      const pre = i > 0 ? rollingRate(rows, i - 1, 3) : null;
      const t = trendInfo(roll.rate, pre ? pre.rate : null, !!pre);
      h += "<tr><td>" + esc(r.date) + "</td><td>" + r.shots + "</td><td>" + r.miss + "</td><td>" + pct(r.rate) + "</td><td>" + pct(roll.rate) + "</td><td>" + trendText(t) + "</td></tr>";
    });
    h += "</tbody></table></div></div>";

    const clubRows = clubTrendRows(rows);
    h += '<div class="trend-card"><div class="trend-top"><div><div class="trend-title">每支球桿穩定性</div><div class="trend-meta">列出所有出現過的球桿；每支球桿用最近五次出現的失誤率判讀。</div></div></div>';
    h += '<div class="tablewrap"><table class="dtable"><thead><tr><th>球桿</th><th>出現</th><th>最近球數</th><th>近五次</th><th>前五次</th><th>趨勢</th></tr></thead><tbody>';
    clubRows.forEach((r) => {
      h += "<tr><td>" + esc(r.club) + "</td><td>" + r.count + "</td><td>" + r.latestShots + "</td><td>" + (r.latestRate == null ? "—" : pct(r.latestRate)) + "</td><td>" + (r.prevRate == null ? "—" : pct(r.prevRate)) + "</td><td>" + trendText(r.trend) + "</td></tr>";
    });
    h += "</tbody></table></div><div class=\"note\">樣本不足代表該球桿還沒有足夠的前後三次資料可比較，不代表表現不好。</div></div></div>";
    el.innerHTML = h;
  }

  function statFromModel(M) {
    const shots = M.totals.shots || 0, used = M.totals.used || 0, miss = Math.max(0, shots - used);
    return { shots, used, miss, rate: shots ? (100 * miss) / shots : 0 };
  }
  function clubStat(o) {
    const shots = o.n_total || 0, used = o.n_used || 0, miss = Math.max(0, shots - used);
    return { shots, used, miss, rate: shots ? (100 * miss) / shots : 0 };
  }
  function rollingRate(rows, end, size) {
    const start = Math.max(0, end - size + 1);
    let shots = 0, miss = 0;
    for (let i = start; i <= end; i++) { shots += rows[i].shots || 0; miss += rows[i].miss || 0; }
    return { shots, miss, rate: shots ? (100 * miss) / shots : 0 };
  }
  function weightedRate(rows) {
    let shots = 0, miss = 0;
    rows.forEach((r) => { shots += r.shots || 0; miss += r.miss || 0; });
    return { shots, miss, rate: shots ? (100 * miss) / shots : null };
  }
  function trendInfo(now, before, enough) {
    if (!enough || before == null || now == null) return { cls: "flat", label: "資料不足", delta: null };
    const d = now - before;
    if (Math.abs(d) < 1) return { cls: "flat", label: "持平", delta: d };
    return d < 0 ? { cls: "good", label: "改善", delta: d } : { cls: "bad", label: "退步", delta: d };
  }
  function trendPill(t) {
    return '<span class="trend-pill ' + t.cls + '">' + esc(t.label) + (t.delta == null ? "" : " " + signedPct(t.delta)) + "</span>";
  }
  function trendText(t) {
    if (!t || t.delta == null) return '<span class="trend-pill flat">資料不足</span>';
    return trendPill(t);
  }
  function clubTrendRows(rows) {
    const clubs = {};
    rows.forEach((r) => {
      Object.keys(r.model.clubs).forEach((c) => {
        const s = clubStat(r.model.clubs[c]);
        (clubs[c] = clubs[c] || []).push({ date: r.date, shots: s.shots, miss: s.miss, rate: s.rate });
      });
    });
    return sortClubs(Object.keys(clubs)).reverse().map((club) => {
      const all = clubs[club];
      const latest = all.slice(-CLUB_TREND_WINDOW);
      const prev = all.slice(-CLUB_TREND_WINDOW * 2, -CLUB_TREND_WINDOW);
      const lr = weightedRate(latest), pr = prev.length ? weightedRate(prev) : { rate: null };
      return {
        club,
        count: all.length,
        latestShots: lr.shots || 0,
        latestRate: lr.rate,
        prevRate: pr.rate,
        trend: trendInfo(lr.rate, pr.rate, prev.length > 0),
      };
    });
  }
  function trendLineChart(rows) {
    const vals = rows.map((r) => r.rate);
    const minRaw = Math.min.apply(null, vals);
    const maxRaw = Math.max.apply(null, vals);
    let yMin = Math.max(0, Math.floor(minRaw / 5) * 5 - 5);
    let yMax = Math.ceil(maxRaw / 5) * 5 + 5;
    if (yMax - yMin < 10) yMax = yMin + 10;
    const W = 640, H = 174, padL = 40, padR = 18, padT = 20, padB = 34;
    const x = (i) => padL + (rows.length <= 1 ? 0 : (i / (rows.length - 1)) * (W - padL - padR));
    const y = (v) => padT + ((yMax - v) / (yMax - yMin)) * (H - padT - padB);
    const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];
    let h = '<svg class="trend-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="整體失誤率時間軸">';
    ticks.forEach((t) => {
      h += '<line x1="' + padL + '" y1="' + y(t) + '" x2="' + (W - padR) + '" y2="' + y(t) + '" stroke="rgba(43,95,227,.14)" stroke-width="1"></line>';
      h += '<text x="' + (padL - 8) + '" y="' + (y(t) + 3) + '" fill="#8a988f" font-size="10" text-anchor="end" font-family="IBM Plex Mono">' + t + '%</text>';
    });
    h += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (H - padB) + '" stroke="rgba(43,95,227,.24)" stroke-width="1"></line>';
    h += '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="rgba(43,95,227,.24)" stroke-width="1"></line>';
    h += '<polyline points="' + rows.map((r, i) => x(i) + "," + y(r.rate)).join(" ") + '" fill="none" stroke="#2b5fe3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline>';
    rows.forEach((r, i) => {
      const px = x(i), py = y(r.rate), labelY = py < 34 ? py + 16 : py - 8;
      h += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="#ffffff" stroke="#2b5fe3" stroke-width="2"><title>' + esc(r.date) + ' · 失誤率 ' + pct(r.rate) + ' · ' + r.miss + '/' + r.shots + '</title></circle>';
      h += '<text x="' + px + '" y="' + labelY + '" fill="#0c1a17" font-size="9.5" text-anchor="middle" font-family="IBM Plex Mono">' + pct(r.rate) + '</text>';
      if (i === 0 || i === rows.length - 1 || i % 3 === 0) {
        h += '<text x="' + px + '" y="' + (H - 12) + '" fill="#8a988f" font-size="9" text-anchor="middle" font-family="IBM Plex Mono">' + shortDate(r.date) + '</text>';
      }
    });
    h += '<text x="12" y="' + ((H - padB + padT) / 2) + '" fill="#5c6b66" font-size="9.5" text-anchor="middle" font-family="IBM Plex Mono" transform="rotate(-90 12 ' + ((H - padB + padT) / 2) + ')">失誤率</text>';
    h += "</svg>";
    return h;
  }
  function sortClubs(list) {
    const order = {};
    BAG_ORDER.forEach((c, i) => { order[c] = i; });
    return list.slice().sort((a, b) => (order[a] == null ? 999 : order[a]) - (order[b] == null ? 999 : order[b]));
  }
  function pct(v) { return Math.round(v) + "%"; }
  function signedPct(v) { return (v > 0 ? "+" : "") + Math.round(v) + "%"; }
  function shortDate(s) {
    const m = String(s || "").match(/^\d{4}-(\d{2})-(\d{2})$/);
    return m ? Number(m[1]) + "/" + Number(m[2]) : String(s || "");
  }
  function launchEval(club, value) {
    const ref = LAUNCH_REFERENCES[club];
    const refText = ref ? ref.low + "–" + ref.high + "°" : "—";
    if (!ref || value == null || !isFinite(value)) return { cls: "none", label: "無參考", refText };
    if (value < ref.low) return { cls: "low", label: "偏低 " + refText, refText };
    if (value > ref.high) return { cls: "high", label: "偏高 " + refText, refText };
    return { cls: "normal", label: "正常 " + refText, refText };
  }
  function launchCell(club, value) {
    const e = launchEval(club, value);
    const v = value == null || !isFinite(value) ? "—" : value + "°";
    return '<div class="launch-cell"><span class="launch-value">' + esc(v) + '</span><span class="launch-tag ' + e.cls + '">' + esc(e.label) + "</span></div>";
  }

  function renderDistTable(M) {
    const C = M.clubs;
    let h = '<table class="dtable"><thead><tr><th>球桿</th><th>落點</th><th>總距離</th><th>範圍</th><th>球速</th><th>出球角</th><th>失誤率</th></tr></thead><tbody>';
    M.order.forEach((c) => {
      const o = C[c];
      h += "<tr><td>" + c + "</td><td>" + o.carry + "</td><td>" + o.total + "</td><td>" + o.carry_min + "–" + o.carry_max + "</td><td>" + o.bs + "</td><td>" + launchCell(c, o.launch) + "</td><td>" + o.mishit_rate + "%</td></tr>";
    });
    h += "</tbody></table>";
    document.querySelector("#disttable").innerHTML = '<div class="tablewrap">' + h + '</div><div class="note">出球角參考值用寬區間判讀，僅作彈道檢查；短桿半揮、低彈道打法與特殊球路不視為異常。</div>';
  }

  function renderBagProfiles() {
    const el = document.querySelector("#bagprofiles");
    if (!el) return;
    const profiles = curPlayer.bagProfiles || [];
    if (!profiles.length) {
      el.innerHTML = '<div class="statebox">這位球員尚未設定球袋資訊。</div>';
      return;
    }
    el.innerHTML = '<div class="bag-grid">' + profiles.map((p) => {
      const when = p.effectiveFrom ? "自 " + p.effectiveFrom + " 起" : p.effectiveBefore ? p.effectiveBefore + " 前" : "";
      let h = '<div class="bag-card"><div><div class="bag-title">' + esc(p.label || "") + '</div><div class="bag-meta">' + esc(when) + (when && p.summary ? " · " : "") + esc(p.summary || "") + "</div></div>";
      (p.sections || []).forEach((sec) => {
        h += '<div class="bag-section"><h3>' + esc(sec.title || "") + "</h3>";
        (sec.items || []).forEach((it) => {
          h += '<div class="bag-item"><div class="bag-club">' + esc(it.club || "") + '</div><div><div class="bag-head">' + esc(it.head || "") + '</div><div class="bag-note">' + esc(it.note || "") + '</div></div><div class="bag-shaft">' + esc(it.shaft || "") + "</div></div>";
        });
        h += "</div>";
      });
      h += "</div>";
      return h;
    }).join("") + "</div>";
  }

  function renderLongCoach() {
    const el = document.querySelector("#longcoach");
    if (!el) return;
    const items = buildLongCoach();
    el.innerHTML = items.map((t) => (
      '<div class="tk ' + (t.p === 1 ? "p1" : "") + '"><div class="tt">' + esc(t.t) + '</div><div class="tb">' + esc(t.b) + "</div></div>"
    )).join("");
  }

  function buildLongCoach() {
    if (!LOADED.length) {
      return [{ p: 2, t: "先匯入場次", b: "目前還沒有可分析的歷史資料；CSV 進來後會自動產生長期教練建議。" }];
    }
    const rows = LOADED.slice().reverse().map((L) => {
      const s = statFromModel(L.model);
      return { date: L.meta.date || "", shots: s.shots, miss: s.miss, rate: s.rate, model: L.model };
    });
    const cards = [];

    if (rows.length >= 2) {
      const latest = rollingRate(rows, rows.length - 1, 3);
      const prev = rollingRate(rows, rows.length - 2, 3);
      const t = trendInfo(latest.rate, prev.rate, true);
      const emphasis = t.cls === "bad" ? "先把練習目標放在降低失誤球，不急著追更遠距離。" : t.cls === "good" ? "這代表穩定性方向正確，下一步可以把同樣節奏帶到新鐵桿全組。" : "狀態大致持平，先用固定熱身與同一個目標線建立可重複性。";
      cards.push({
        p: t.cls === "bad" ? 1 : 2,
        t: "整體穩定性：" + t.label + (t.delta == null ? "" : " " + signedPct(t.delta)),
        b: "最新近三場失誤率 " + pct(latest.rate) + "，前一個近三場 " + pct(prev.rate) + "。" + emphasis,
      });
    } else {
      cards.push({ p: 2, t: "整體穩定性仍在累積", b: "目前只有 1 場可比較；至少 2 場後才會自動判讀近三場升降。" });
    }

    coachRuleCards((ALLANALYSIS && ALLANALYSIS.findings) || []).forEach((card) => {
      if (cards.length < 4) cards.push(card);
    });

    const clubRows = clubTrendRows(rows).filter((r) => r.latestShots >= 8 && r.latestRate != null);
    if (clubRows.length) {
      const target = clubRows.slice().sort((a, b) => clubCoachScore(b) - clubCoachScore(a))[0];
      const change = target.prevRate == null ? "前段資料不足" : "前段 " + pct(target.prevRate) + "，" + target.trend.label + (target.trend.delta == null ? "" : " " + signedPct(target.trend.delta));
      cards.push({
        p: target.trend && target.trend.cls === "bad" ? 1 : 2,
        t: "練習優先桿：" + target.club,
        b: target.club + " 最近五次出現共 " + target.latestShots + " 球，失誤率 " + pct(target.latestRate) + "；" + change + "。先把這支桿的擊球品質拉穩，再回頭看距離階梯。",
      });
    }

    const recent = LOADED.slice(0, Math.min(3, LOADED.length));
    const dir = directionSnapshot(recent, (c) => isIron(c));
    if (dir.total >= 8) {
      if (dir.side === "right") {
        cards.push({ p: 1, t: "近期鐵桿方向偏右", b: "近三場鐵桿/楔桿穩定球方向為右 " + dir.right + "、左 " + dir.left + "、中 " + dir.center + "。練習時先做目標線、桿面起始方向與收桿穩定，不要只用身體硬拉回來。" });
      } else if (dir.side === "left") {
        cards.push({ p: 1, t: "近期鐵桿方向偏左", b: "近三場鐵桿/楔桿穩定球方向為左 " + dir.left + "、右 " + dir.right + "、中 " + dir.center + "。先確認站位與桿面是否一起關掉，再看是否需要調整揮桿路徑。" });
      } else {
        cards.push({ p: 2, t: "近期鐵桿方向較均衡", b: "近三場鐵桿/楔桿穩定球方向為左 " + dir.left + "、右 " + dir.right + "、中 " + dir.center + "。方向不是最大風險時，優先練距離控制與落點分布。" });
      }
    }

    const event = ((curPlayer || {}).targetEvents || [])[0];
    if (event) {
      const holes = eventRiskHoles(event).join("、") || "高風險洞";
      const label = eventRiskLabel(event);
      const title = event.course || event.title || "目標賽事";
      const p = dir.side === "right" ? 1 : 2;
      cards.push({
        p,
        t: "賽事策略連動：" + label + "保守一級",
        b: title + " 的 " + holes + " 洞屬於" + label + "。當天 tee shot 與攻果嶺先用「保守落點、可救位置、雙柏忌封頂」當決策順序；若熱身時方向偏差明顯，這些洞直接降一支桿或改三段打法。",
      });
    }

    cards.push({
      p: 2,
      t: "自動化方式",
      b: "CSV 更新後會重算規則：失誤率趨勢、每支球桿穩定性、距離階梯、出球角參考值、方向偏移與賽事風險。AI 只負責把結果寫得更像教練口吻，核心判斷先由資料直接產生。",
    });
    return cards.slice(0, 5);
  }

  function renderActionCenter() {
    const el = document.querySelector("#actioncenter");
    if (!el) return;
    if (!LOADED.length || !ALLMODEL || !ALLANALYSIS) {
      el.innerHTML = '<div class="statebox">匯入 CSV 後會自動產生本週練習優先順序。</div>';
      return;
    }
    const data = buildActionCenter();
    const priority = data.priority;
    let h = '<div class="action-grid"><div class="action-hero ' + esc(priority.cls) + '">';
    h += '<div class="action-eyebrow">' + esc(priority.category || "Action Center") + '</div>';
    h += '<div class="action-title">' + esc(priority.title) + "</div>";
    h += '<div class="action-body">' + esc(priority.body) + "</div>";
    h += '<div class="action-metrics"><span>近三場失誤率 <b>' + pct(data.metrics.latestRate) + '</b></span><span>優先桿 <b>' + esc(data.metrics.club || "—") + '</b></span><span>目標賽事 <b>' + esc(data.metrics.event || "—") + '</b></span></div>';
    h += '</div><div class="action-side"><div class="action-side-title">本週 3 件事</div>';
    data.practice.forEach((item, i) => {
      h += '<div class="action-task"><span class="num">' + (i + 1) + "</span><p>" + esc(item) + "</p></div>";
    });
    h += "</div></div>";
    h += '<div class="action-event"><b>' + esc(data.event.title) + "</b><span>" + esc(data.event.body) + "</span></div>";
    el.innerHTML = h;
  }

  function buildActionCenter() {
    const rows = LOADED.slice().reverse().map((L) => {
      const s = statFromModel(L.model);
      return { date: L.meta.date || "", shots: s.shots, miss: s.miss, rate: s.rate, model: L.model };
    });
    const latest = rollingRate(rows, rows.length - 1, Math.min(3, rows.length));
    const prev = rows.length >= 2 ? rollingRate(rows, rows.length - 2, Math.min(3, rows.length - 1)) : { rate: null };
    const trend = trendInfo(latest.rate, prev.rate, rows.length >= 2);
    const ruleItems = matchedCoachRules((ALLANALYSIS && ALLANALYSIS.findings) || []);
    const clubRows = clubTrendRows(rows).filter((r) => r.latestShots >= 8 && r.latestRate != null);
    const club = clubRows.length ? clubRows.slice().sort((a, b) => clubCoachScore(b) - clubCoachScore(a))[0] : null;
    const top = ruleItems[0];
    const event = ((curPlayer || {}).targetEvents || [])[EVENT_INDEX] || ((curPlayer || {}).targetEvents || [])[0] || null;
    const context = actionContext(top && top.finding, top && top.rule, club, event, latest, trend);
    const priority = top
      ? {
          cls: top.rule.priority >= 85 ? "urgent" : "steady",
          category: top.rule.category || "本週優先",
          title: fillTemplate(top.rule.title || top.rule.cardTitle || top.finding.t, context),
          body: fillTemplate(top.rule.cardBody || top.finding.b, context),
        }
      : fallbackPriority(latest, trend);
    const practice = actionPractice(ruleItems, club);
    return {
      priority,
      practice,
      event: eventAction(event, club),
      metrics: {
        latestRate: latest.rate,
        club: club ? club.club : "",
        event: event ? (event.course || event.title || "") : "",
      },
    };
  }

  function matchedCoachRules(findings) {
    const rules = (COACH_RULES && COACH_RULES.rules) || [];
    return findings
      .map((finding) => {
        const rule = rules.find((r) => ruleMatchesFinding(r, finding));
        return rule ? { finding, rule } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b.rule.priority || 0) + (b.finding.sev || 0) * 10 - ((a.rule.priority || 0) + (a.finding.sev || 0) * 10));
  }

  function ruleMatchesFinding(rule, finding) {
    if (!rule || !finding) return false;
    if (rule.pill && rule.pill === finding.pill) return true;
    if (rule.pillAny && rule.pillAny.indexOf(finding.pill) >= 0) return true;
    return false;
  }

  function actionContext(finding, rule, club, event, latest, trend) {
    return {
      findingTitle: finding ? finding.t : "",
      findingBody: finding ? finding.b : "",
      ruleTitle: rule ? rule.title : "",
      club: club ? club.club : "",
      latestRate: pct(latest.rate),
      trendLabel: trend ? trend.label : "",
      trendDelta: trend && trend.delta != null ? signedPct(trend.delta) : "",
      eventTitle: event ? (event.course || event.title || "") : "",
      riskHoles: event ? eventRiskHoles(event).join("、") : "",
    };
  }

  function fillTemplate(text, data) {
    return String(text || "").replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => data[key] == null ? "" : data[key]);
  }

  function fallbackPriority(latest, trend) {
    const bad = trend && trend.cls === "bad";
    return {
      cls: bad ? "urgent" : "steady",
      category: "本週優先",
      title: bad ? "先把失誤率壓回來" : "維持節奏，累積可比較樣本",
      body: "近三場失誤率 " + pct(latest.rate) + (trend && trend.delta != null ? "，趨勢 " + trend.label + " " + signedPct(trend.delta) : "") + "。先用固定練習流程建立可重複性。",
    };
  }

  function actionPractice(ruleItems, club) {
    const out = [];
    ruleItems.forEach((item) => {
      (item.rule.practice || []).forEach((p) => {
        if (out.length < 3 && out.indexOf(p) < 0) out.push(p);
      });
    });
    if (club && out.length < 3) out.push(club.club + " 做 5 球一組品質檢查，連續兩組 4/5 穩定球才加速。");
    ((COACH_RULES && COACH_RULES.fallbackPractice) || []).forEach((p) => {
      if (out.length < 3 && out.indexOf(p) < 0) out.push(p);
    });
    return out.slice(0, 3);
  }

  function eventAction(event, club) {
    if (!event) return { title: "賽事連動", body: "尚未設定目標賽事；練習先以穩定球與距離階梯為主。" };
    const holes = eventRiskHoles(event);
    const risk = holes.length ? holes.join("、") + " 洞" : "高風險洞";
    const clubText = club ? "；本週優先桿 " + club.club + " 的穩定性會直接影響這些洞的保守策略" : "";
    return {
      title: "賽事連動：" + (event.course || event.title || "目標球場"),
      body: "把 " + risk + " 當作練習情境，預設保守落點與雙柏忌封頂" + clubText + "。",
    };
  }

  function coachRuleCards(findings) {
    const out = [], used = {};
    findings.forEach((f) => {
      if (!f || f.sev < 1 || out.length >= 2) return;
      const key = f.pill + ":" + f.t;
      if (used[key]) return;
      const card = coachRuleCard(f);
      if (!card) return;
      used[key] = 1;
      out.push(card);
    });
    return out;
  }

  function coachRuleCard(f) {
    const item = matchedCoachRules([f])[0];
    if (!item) return null;
    const ctx = actionContext(f, item.rule, null, ((curPlayer || {}).targetEvents || [])[0] || null, { rate: 0 }, null);
    return {
      p: f.sev >= 2 || (item.rule.priority || 0) >= 80 ? 1 : 2,
      t: fillTemplate(item.rule.cardTitle || item.rule.title || f.t, ctx),
      b: fillTemplate(item.rule.cardBody || f.b, ctx),
    };
  }

  function clubCoachScore(r) {
    let score = r.latestRate || 0;
    if (r.trend && r.trend.cls === "bad") score += 70;
    if (r.trend && r.trend.cls === "good") score -= 15;
    score += Math.min(30, r.latestShots || 0) / 3;
    return score;
  }

  function directionSnapshot(sessions, keepClub) {
    const out = { left: 0, right: 0, center: 0, total: 0, side: "balanced" };
    sessions.forEach((L) => {
      Object.keys(L.model.clubs).forEach((c) => {
        if (keepClub && !keepClub(c)) return;
        const o = L.model.clubs[c];
        out.left += o.n_left || 0;
        out.right += o.n_right || 0;
        out.center += o.n_center || 0;
      });
    });
    out.total = out.left + out.right + out.center;
    if (out.total >= 8 && out.right >= out.left * 1.35 && out.right - out.left >= 4) out.side = "right";
    else if (out.total >= 8 && out.left >= out.right * 1.35 && out.left - out.right >= 4) out.side = "left";
    return out;
  }

  // ---------- CSV ----------
  function parseCSV(text, meta) {
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
      const club = relabel((c[iClub] || "").trim(), meta);
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
  function relabel(c, meta) {
    return c === "SW" && meta && meta.date === "2026-06-23" ? "W" : c;
  }
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
    const pointsByClub = {};
    Object.keys(byClub).forEach((club) => {
      pointsByClub[club] = byClub[club].map((s) => ({
        club,
        shot: s.shot,
        carry: s.carry,
        total: s.total,
        off: s.offset,
        launch: s.launch,
        bs: s.ballSpeed,
        keep: !s._out,
      }));
    });
    const driver = pointsByClub.D || [];
    const used = order.reduce((a, c) => a + clubs[c].n_used, 0);
    return { clubs, order, driver, pointsByClub, totals: { shots: shots.length, used } };
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
    const launchLow = [], launchHigh = [];
    order.forEach((c) => {
      const o = C[c], e = launchEval(c, o.launch);
      if (o.n_used < 5 || e.cls === "none" || e.cls === "normal") return;
      const txt = c + " " + o.launch + "°（參考 " + e.refText + "）";
      if (e.cls === "low") launchLow.push(txt);
      if (e.cls === "high") launchHigh.push(txt);
    });
    if (launchLow.length >= 2) F.push({ sev: 1, pill: "出球角", t: "多支球桿出球角偏低", b: launchLow.join("、") + "。若同時 carry 不足，優先檢查擊球點、球位與是否打薄，不急著改桿。" });
    if (launchHigh.length >= 2) F.push({ sev: 1, pill: "出球角", t: "多支球桿出球角偏高", b: launchHigh.join("、") + "。若同時總距離掉或最高點過高，優先檢查動態桿面角與是否打到桿面上方。" });
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
      case "出球角": return "用出球角參考值確認彈道：" + f.t;
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
  }

  function renderDeepSelector(M) {
    const sel = document.querySelector("#deep-club-select");
    if (!sel) return;
    const clubs = M.order.slice().reverse();
    if (DEEP_CLUB !== "all" && !M.clubs[DEEP_CLUB]) DEEP_CLUB = "all";
    sel.innerHTML = ['<option value="all">全部球桿</option>']
      .concat(clubs.map((c) => '<option value="' + esc(c) + '">' + esc(c) + '</option>'))
      .join("");
    sel.value = DEEP_CLUB;
    sel.onchange = function () {
      DEEP_CLUB = sel.value;
      if (MODEL) renderScatter(MODEL);
    };
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
      const clubTitle = c + "：落點 " + o.carry + " 碼、總距離 " + o.total + " 碼、落點範圍 " + o.carry_min + "–" + o.carry_max + " 碼、採用 " + o.n_used + "/" + o.n_total + " 球、失誤率 " + o.mishit_rate + "%";
      let bars;
      if (MODE === "carry") bars = '<div class="bar carry" title="' + esc(clubTitle) + '" style="width:' + carryW + '%"></div>';
      else if (MODE === "total") bars = '<div class="bar carry" title="' + esc(clubTitle) + '" style="width:' + totalW + '%"></div>';
      else bars = '<div class="bar roll" title="' + esc(c + " 總距離 " + o.total + " 碼") + '" style="width:' + totalW + '%"></div><div class="bar carry" title="' + esc(c + " 落點 " + o.carry + " 碼") + '" style="width:' + carryW + '%"></div>';
      const dist =
        MODE === "carry" ? '<span class="num">' + o.carry + "</span>"
          : MODE === "total" ? '<span class="num">' + o.total + "</span>"
            : '<span class="num">' + o.carry + '</span> <span class="t num">/ ' + o.total + "</span>";
      const bv = B.clubs[c];
      let marker = "", benchTxt = "";
      if (bv) {
        const benchTitle = B.label + "：" + c + " 基準 " + bv + " 碼（比" + (B.metric === "carry" ? "落點" : "總距離") + "）";
        marker = '<span class="bench-marker" title="' + esc(benchTitle) + '" style="left:' + clamp((bv / MAX) * 100, 1, 100) + '%"></span>';
        const own = B.metric === "carry" ? o.carry : o.total;
        const d = own - bv;
        benchTxt = '<span class="bench ' + (d >= 0 ? "up" : "down") + '">基準 ' + bv + " · " + (d >= 0 ? "+" : "") + d + "</span>";
      }
      html += '<div class="row" title="' + esc(clubTitle) + '"><div class="club' + isW + '">' + c + '</div><div class="track">' + bars + marker + '</div><div class="dist">' + dist + benchTxt + "</div></div>";
      if (i < order.length - 1) {
        const b = order[i + 1], g = C[b].carry - o.carry, iron = isIron(c) && isIron(b);
        const gapTitle = c + " 到 " + b + " 的落點差 " + g + " 碼";
        if (iron && g <= -5) html += '<div class="gapchip gap-hole" title="' + esc(gapTitle) + '">⚠ ' + b + " 比 " + c + " 短 " + Math.abs(g) + " 碼 — 反序</div>";
        else if (iron && Math.abs(g) < 5) html += '<div class="gapchip gap-over" title="' + esc(gapTitle) + '">↕ ' + c + "↔" + b + " 未拉開（差 " + g + " 碼）</div>";
        else if (g >= 25) html += '<div class="gapchip gap-hole" title="' + esc(gapTitle) + '">⚠ 到 ' + b + " 有 " + g + " 碼大缺口</div>";
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
        const launch = launchEval(c, o.launch);
        return (
          '<div class="cc"><div class="cc-top"><div class="cc-club' + isW + '">' + c + '</div><div class="cc-n">採用 ' + o.n_used + "/" + o.n_total + "<br>失誤率 " + o.mishit_rate + '%</div></div>' +
          '<div class="cc-main"><span class="big num">' + o.carry + '</span><span class="unit">碼 落點</span></div>' +
          '<div class="cc-sub">總距離 ' + o.total + " 碼 · 範圍 " + o.carry_min + "–" + o.carry_max + '</div>' +
          '<div class="cc-grid"><div>球速<b class="num">' + o.bs + ' mph</b></div><div>出球角<b class="num">' + o.launch + '°</b><span class="launch-tag ' + launch.cls + '">' + esc(launch.label) + '</span></div><div>最高點<b class="num">' + o.apex + ' ft</b></div><div>一致性<b>' + consist(o.total_std) + "</b></div></div>" +
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
    const selection = DEEP_CLUB === "all" || !M.clubs[DEEP_CLUB] ? "all" : DEEP_CLUB;
    const pts = selection === "all"
      ? M.order.slice().reverse().reduce((acc, c) => acc.concat((M.pointsByClub && M.pointsByClub[c]) || []), [])
      : ((M.pointsByClub && M.pointsByClub[selection]) || []);
    const svg = document.querySelector("#dsvg");
    const title = selection === "all" ? "全部球桿深入分析" : selection + " 深入分析";
    const sub = document.querySelector("#deep-sub");
    document.querySelector("#scatter-title").textContent = title;
    if (sub) sub.textContent = selection === "all" ? "全部球桿合併：" + pts.length + " 球" : selection + "：" + pts.length + " 球";
    if (!pts.length) { svg.innerHTML = '<text x="180" y="120" text-anchor="middle" fill="#8a96a8" font-size="12" font-family="IBM Plex Mono">這個選項目前沒有資料</text>'; return; }
    const W = 360, H = 240, padL = 40, padR = 14, padT = 16, padB = 30;
    const xs = pts.map((d) => d.total);
    const xmin = Math.min.apply(null, xs) - 8, xmax = Math.max.apply(null, xs) + 8;
    const xSpan = Math.max(1, xmax - xmin);
    const offMax = Math.max(10, Math.max.apply(null, pts.map((d) => Math.abs(d.off || 0))) + 2);
    const X = (v) => padL + ((v - xmin) / xSpan) * (W - padL - padR);
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
    const kept = pts.filter((d) => d.keep);
    if (selection !== "all" && kept.length >= 4) {
      const mx = mean(kept.map((d) => d.total)), my = mean(kept.map((d) => d.off));
      const sx = Math.max(8, Math.abs(X(mx + std(kept.map((d) => d.total)) * 1.7) - X(mx)));
      const sy = Math.max(8, Math.abs(Y(my + std(kept.map((d) => d.off)) * 1.7) - Y(my)));
      s += '<ellipse cx="' + X(mx) + '" cy="' + Y(my) + '" rx="' + sx + '" ry="' + sy + '" fill="rgba(43,95,227,.08)" stroke="rgba(43,95,227,.45)" stroke-width="1.2" stroke-dasharray="4 3"></ellipse>';
    }
    const r = pts.length > 240 ? 1.35 : pts.length > 120 ? 1.8 : pts.length > 70 ? 2.1 : pts.length > 35 ? 2.5 : 3;
    pts.forEach((d) => {
      const col = d.keep ? "#164dff" : "#ff5c7a";
      const oc = d.keep ? "rgba(12,26,23,.42)" : "#c0405a";
      s += '<circle cx="' + X(d.total) + '" cy="' + Y(d.off) + '" r="' + (d.keep ? r : Math.max(1.2, r - 0.2)) + '" fill="' + col + '" fill-opacity="' + (d.keep ? 0.50 : 0.40) + '" stroke="' + oc + '" stroke-width=".6"><title>' + esc(d.club || "") + " · " + (d.keep ? "穩定球" : "失誤球") + " · 總距離 " + Math.round(d.total) + "碼 · 落點 " + Math.round(d.carry) + "碼 · " + fmtOff(d.off) + "</title></circle>";
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

  function renderTargetEvents() {
    const el = document.querySelector("#eventplan");
    if (!el) return;
    const events = curPlayer.targetEvents || [];
    if (!events.length) {
      el.innerHTML = '<div class="statebox">這位球員尚未設定目標賽事。</div>';
      return;
    }
    EVENT_INDEX = clamp(EVENT_INDEX, 0, events.length - 1);
    const e = events[EVENT_INDEX];
    const teeKpi = eventTeeKpi(e);
    const goalKpi = eventGoalKpi(e);
    const riskHoles = eventRiskHoles(e);
    let h = "";
    if (events.length > 1) {
      h += '<div class="event-switch"><label for="event-select">攻略切換</label><select id="event-select">';
      events.forEach((ev, i) => {
        h += '<option value="' + i + '"' + (i === EVENT_INDEX ? " selected" : "") + ">" + esc(eventOptionLabel(ev)) + "</option>";
      });
      h += '</select><span>' + esc(e.course || "") + " · " + esc(e.date || "") + "</span></div>";
    }
    h += '<div class="event-hero"><h2>' + esc(e.title || "") + '</h2><div class="event-meta">' + esc(e.course || "") + " · " + esc(e.date || "") + '</div>';
    h += '<div class="event-kpis"><div class="event-kpi"><b>' + esc(teeKpi.value) + "</b><span>" + esc(teeKpi.label) + '</span></div><div class="event-kpi"><b>' + esc(goalKpi.value) + "</b><span>" + esc(goalKpi.label) + '</span></div><div class="event-kpi"><b>' + esc(riskHoles.join(" / ") || "—") + "</b><span>" + esc(eventRiskLabel(e)) + "</span></div></div>";
    h += '<div class="event-callout"><b>最大風險：</b>' + esc(e.riskSummary || "") + "</div>";
    h += '<div class="event-callout"><b>梯台策略：</b>' + esc(e.teeRecommendation || "") + "</div>";
    h += '<div class="event-legend"><span class="par-pill par3">Par 3</span><span class="par-pill par4">Par 4</span><span class="par-pill par5">Par 5</span></div>';
    h += '<div class="event-meta">' + esc(e.goalScore || "") + "</div></div>";

    const holeTargets = e.holeTargets || [];
    const holeMaps = holeTargets.filter((r) => eventHoleImage(e, r.hole));
    if (e.courseMap || holeMaps.length || e.mapNote) {
      const map = e.courseMap || {};
      h += '<div class="sec"><div class="sec-h"><span class="sec-n num">02</span><span class="sec-t">球場全區與逐洞示意圖</span></div>';
      if (map.imageUrl) {
        h += '<div class="course-map"><a href="' + esc(map.sourceUrl || map.imageUrl) + '" target="_blank" rel="noopener"><img src="' + esc(map.imageUrl) + '" alt="' + esc(map.title || "球場全區地圖") + '"></a><div class="event-meta">來源：<a href="' + esc(map.sourceUrl || map.imageUrl) + '" target="_blank" rel="noopener">' + esc(map.sourceLabel || "球場資料來源") + "</a></div></div>";
      }
      if (holeMaps.length) {
        h += '<div class="hole-map-grid" style="margin-top:10px">';
        holeMaps.forEach((r) => {
          const parClass = r.par === 3 ? "par3" : r.par === 5 ? "par5" : "par4";
          const src = eventHoleImage(e, r.hole);
          const url = eventHoleLink(e, r.hole) || src;
          h += '<a class="hole-map" href="' + esc(url) + '" target="_blank" rel="noopener"><div class="hole-map-top"><span>Hole ' + r.hole + '</span><span class="par-pill ' + parClass + '">Par ' + r.par + '</span></div><div class="hole-yard">' + eventYardText(e, r) + '</div><img loading="lazy" src="' + esc(src) + '" alt="' + esc((e.course || "球場") + "第" + r.hole + '洞球道示意圖') + '"><div class="hole-map-note">' + esc(r.note || "") + "</div></a>";
        });
        h += '</div><div class="note">' + esc(e.holeMapNote || "球道示意圖使用球場公開逐洞圖；點圖可開啟資料來源。") + "</div>";
      }
      if (e.mapNote) {
        h += '<div class="event-card map-note">' + esc(e.mapNote) + "</div>";
      }
      h += "</div>";
    }

    h += '<div class="sec"><div class="sec-h"><span class="sec-n num">03</span><span class="sec-t">逐洞目標桿</span></div><div class="tablewrap"><table class="dtable event-hole-table"><thead><tr><th>洞</th><th>Par</th><th>碼數</th><th>HCP</th><th>目標</th><th>重點</th></tr></thead><tbody>';
    holeTargets.forEach((r) => {
      const holeTag = eventHoleTag(e, r.hole);
      const parClass = r.par === 3 ? "par3" : r.par === 5 ? "par5" : "par4";
      h += '<tr class="' + parClass + '"><td>' + r.hole + (holeTag ? " · " + esc(holeTag) : "") + '</td><td><span class="par-pill ' + parClass + '">Par ' + r.par + '</span></td><td class="yard-cell">' + eventYardText(e, r) + "</td><td>" + esc(r.hcp || "—") + "</td><td>" + esc(r.target || "—") + "</td><td style=\"white-space:normal;text-align:left\">" + esc(r.note || "") + "</td></tr>";
    });
    h += "</tbody></table></div></div>";

    h += '<div class="sec"><div class="sec-h"><span class="sec-n num">04</span><span class="sec-t">三週訓練計畫</span></div><div class="event-list">';
    (e.trainingPlan || []).forEach((p) => {
      h += '<div class="event-card"><div class="event-title">' + esc(p.title || "") + '</div><ul class="event-plan">';
      (p.items || []).forEach((it) => { h += "<li>" + esc(it) + "</li>"; });
      h += "</ul></div>";
    });
    h += "</div></div>";

    h += '<div class="sec"><div class="sec-h"><span class="sec-n num">05</span><span class="sec-t">當天 Checklist</span></div><div class="event-card"><ul class="event-plan">';
    (e.checklist || []).forEach((it) => { h += "<li>" + esc(it) + "</li>"; });
    h += "</ul></div></div>";
    if ((e.sourceUrls || []).length) {
      h += '<div class="event-sources">資料來源：' + e.sourceUrls.map((s) => '<a href="' + esc(s.url || s) + '" target="_blank" rel="noopener">' + esc(s.label || s.url || s) + "</a>").join(" · ") + "</div>";
    }
    el.innerHTML = h;
    const pick = el.querySelector("#event-select");
    if (pick) {
      pick.addEventListener("change", () => {
        EVENT_INDEX = +pick.value || 0;
        renderTargetEvents();
      });
    }
  }

  function eventOptionLabel(e) {
    return (e.title || e.course || "未命名攻略") + (e.date ? " · " + e.date : "");
  }
  function eventTeeKpi(e) {
    if (e.teeKpi) return e.teeKpi;
    if (String(e.id || "").indexOf("donghua") >= 0) return { value: "紅梯", label: "建議梯台 5,813 碼" };
    return { value: "梯台", label: "依當天球局確認" };
  }
  function eventGoalKpi(e) {
    if (e.goalKpi) return e.goalKpi;
    if (String(e.id || "").indexOf("donghua") >= 0) return { value: "~94", label: "目標總桿" };
    return { value: "—", label: "目標總桿" };
  }
  function eventRiskHoles(e) {
    return e.riskHoles || e.rightObHoles || e.leftObHoles || e.waterHoles || [];
  }
  function eventRiskLabel(e) {
    if (e.riskHoleLabel) return e.riskHoleLabel;
    if (e.rightObHoles && e.rightObHoles.length) return "右 OB 重點洞";
    if (e.leftObHoles && e.leftObHoles.length) return "左 OB 重點洞";
    if (e.waterHoles && e.waterHoles.length) return "水障礙重點洞";
    return "高風險洞";
  }
  function eventHoleTag(e, hole) {
    if ((e.rightObHoles || []).indexOf(hole) >= 0) return "右OB";
    if ((e.leftObHoles || []).indexOf(hole) >= 0) return "左OB";
    if ((e.waterHoles || []).indexOf(hole) >= 0) return "水";
    if ((e.riskHoles || []).indexOf(hole) >= 0) return "風險";
    return "";
  }
  function eventHoleImage(e, hole) {
    if (e.holeMaps && e.holeMaps[hole]) return e.holeMaps[hole];
    if (String(e.id || "").indexOf("donghua") >= 0) return donghuaHoleImage(hole);
    return "";
  }
  function eventHoleLink(e, hole) {
    if (e.holeMapLinks && e.holeMapLinks[hole]) return e.holeMapLinks[hole];
    if (e.holeMapSourceBaseUrl) return e.holeMapSourceBaseUrl + hole + "/";
    return "";
  }
  function eventYardText(e, row) {
    const hole = typeof row === "number" ? row : row.hole;
    const target = typeof row === "object" ? row : (e.holeTargets || []).find((r) => r.hole === hole) || {};
    const y = target.yards || (String(e.id || "").indexOf("donghua") >= 0 ? DONGHUA_YARDS[hole] : null);
    return yardText(y);
  }
  function yardText(y) {
    if (!y) return "—";
    const labels = { red: "紅", white: "白", blue: "藍", gold: "金", black: "黑" };
    const preferred = y.recommendedTee || y.preferred || "red";
    const keys = [preferred].concat(["red", "white", "blue", "gold", "black"].filter((k) => k !== preferred));
    const parts = [];
    keys.forEach((k) => {
      if (y[k]) parts.push('<span class="' + (k === preferred ? "yard-main" : "") + '">' + (labels[k] || k) + " " + y[k] + "y</span>");
    });
    if (!parts.length && y.recommended) parts.push('<span class="yard-main">建議 ' + y.recommended + "y</span>");
    return parts.join("");
  }

  function donghuaHoleImage(hole) {
    const base = DONGHUA_OLD_HOLE_MAPS[hole]
      ? "https://donghuaelitegolf.com/wp-content/uploads/2023/07/東華1-18洞-" + hole + ".png"
      : "https://donghuaelitegolf.com/wp-content/uploads/2024/02/2024東華1-18洞-" + hole + "-new.png";
    return encodeURI(base);
  }

  function renderFoot(M) {
    document.querySelector("#foot").innerHTML =
      "方法：以「無坡 · 比賽球」為主數據。穩定球過濾＝落點/球速低於該桿中位數 75%、或出球角≤5°、或最高點≤2ft（一號木另含沖天炮規則）視為失誤球，只用穩定球算平均與 gapping。本場 " +
      M.totals.shots + " 球，採用 " + M.totals.used + " 球。<br><b>出球角：</b>讀取 CSV 的 <b>出球角度(度)</b> 欄位，並用各球桿參考區間標示偏低 / 正常 / 偏高。<br><b>球桿標籤：</b>2026-06-23 新鐵桿場次的 CSV <b>SW</b> 正名為 <b>W（T250 48°）</b>；舊資料的 <b>SW</b> 保留為 Kirkland 56°。資料即時由 CSV 計算，數字會隨資料更新。";
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
  function readAvatarStyle() {
    try {
      const v = localStorage.getItem("golfRoomAvatarStyle");
      return v === "cyber" ? "cyber" : "cute";
    } catch (e) {
      return "cute";
    }
  }
  function saveAvatarStyle(v) {
    try {
      localStorage.setItem("golfRoomAvatarStyle", v === "cyber" ? "cyber" : "cute");
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
})();
