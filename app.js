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
  let UI_THEME = readTheme();
  let TARGET_DISTANCE = 150;
  let RECENT_DISTANCES = readRecentDistances();
  let PINNED_DISTANCES = readPinnedDistances();
  let CONFIDENCE_VIEW = readConfidenceView();
  let COURSE_MODE = readCourseMode();
  let CONFIDENCE_MODE = readConfidenceMode();
  let PLAYING_ADJUST = readPlayingAdjust();
  let PIN_POSITION = readPinPosition();
  let BALL_LIE = readBallLie();
  let HAZARD_SIDE = readHazardSide();
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
      applyTheme(UI_THEME);
      bindTheme();
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
      renderFieldDock();
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
  function bindTheme() {
    const sel = document.querySelector("#theme-select");
    if (!sel) return;
    sel.value = UI_THEME;
    sel.addEventListener("change", () => {
      UI_THEME = normalizeTheme(sel.value);
      applyTheme(UI_THEME);
      saveTheme(UI_THEME);
    });
    bindSystemThemeWatcher();
  }
  function applyTheme(v) {
    const actual = actualTheme(v);
    document.body.dataset.theme = actual;
    document.body.dataset.themeMode = normalizeTheme(v);
    const meta = document.querySelector("#theme-color");
    if (meta) meta.setAttribute("content", actual === "dark" ? "#07100f" : "#f4f7f2");
    const current = document.querySelector("#theme-current");
    if (current) current.textContent = themeStatusText(v, actual);
    updateThemeStatusBar(v, actual);
  }

  function updateThemeStatusBar(v, actual) {
    const el = document.querySelector("#theme-status-bar");
    if (!el) return;
    const mode = normalizeTheme(v);
    const label = actual === "dark" ? "科技黑" : "科技白";
    const source = mode === "auto" ? "自動跟隨系統，目前使用 " + label : mode === "dark" ? "夜間高對比資料視圖" : "白天高對比資料視圖";
    el.innerHTML = '<span>' + esc(mode === "auto" ? "AUTO" : "MODE") + '</span><b>' + esc(label) + '</b><small>' + esc(source) + "</small>";
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
    renderCoachDigest();
    renderPracticeMenu();
    renderConfidenceCard();
    renderFieldDock();
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

  function compactEquipment(text) {
    text = String(text || "");
    if (!text) return "";
    if (text.indexOf("Titleist T250") >= 0) return "新鐵桿 T250 5i-W · Qi35 木桿";
    if (text.indexOf("Callaway") >= 0 || text.indexOf("Great Big Bertha") >= 0) return "Callaway 舊鐵桿 · Qi35 木桿";
    if (text.indexOf("Kirkland") >= 0) return "舊楔桿 Kirkland · Qi35 木桿";
    return text.length > 42 ? text.slice(0, 42) + "..." : text;
  }

  function headerSummary() {
    const equipment = compactEquipment(CURMETA.equipment);
    if (curSel === "all") {
      const latest = LOADED[0] && LOADED[0].meta ? LOADED[0].meta.date : "";
      return ["合計 " + LOADED.length + " 場", latest ? "最新 " + latest : "", equipment].filter(Boolean).join(" · ");
    }
    return [CURMETA.date || "", equipment].filter(Boolean).join(" · ");
  }

  function renderHeader() {
    const M = MODEL;
    renderPlayerProfile(curPlayer, LOADED);
    document.querySelector("#h-title").textContent = (curPlayer.name || curPlayer.id || "") + (curSel === "all" ? " · 全部場次" : (CURMETA.label ? " · " + CURMETA.label : (CURMETA.date ? " · " + CURMETA.date : "")));
    document.querySelector("#h-sub").textContent = headerSummary();
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

  function renderCoachDigest() {
    const el = document.querySelector("#coachdigest");
    if (!el) return;
    if (!LOADED.length || !ALLMODEL || !ALLANALYSIS) {
      el.innerHTML = '<div class="statebox">匯入 CSV 後會自動產生可複製的教練摘要。</div>';
      return;
    }
    const d = buildCoachDigest();
    el.innerHTML = '<div class="coach-digest"><div class="coach-digest-head"><div><span>AUTO COACH</span><b>' + esc(d.title) + '</b></div><button class="coach-digest-copy" type="button">複製摘要</button></div>' +
      '<div class="coach-digest-call">' + esc(d.call) + '</div>' +
      '<div class="coach-digest-grid">' + d.items.map((it) => '<div class="' + esc(it.cls || "") + '"><b>' + esc(it.t) + '</b><span>' + esc(it.b) + '</span></div>').join("") + '</div>' +
      '<div class="coach-digest-plan"><b>下一次練習</b><ol>' + d.practice.map((p) => '<li>' + esc(p) + '</li>').join("") + '</ol></div></div>';
    const copy = el.querySelector(".coach-digest-copy");
    if (copy) {
      copy.addEventListener("click", async () => {
        try {
          await writeClipboardText(d.text);
          copy.textContent = "已複製";
          copy.classList.add("done");
          setTimeout(() => {
            copy.textContent = "複製摘要";
            copy.classList.remove("done");
          }, 1200);
        } catch (e) {
          copy.textContent = "失敗";
          setTimeout(() => { copy.textContent = "複製摘要"; }, 1200);
        }
      });
    }
  }

  function buildCoachDigest() {
    const action = buildActionCenter();
    const latest = LOADED[0] || {};
    const latestStat = latest.model ? statFromModel(latest.model) : { shots: 0, rate: 0 };
    const rows = LOADED.slice().reverse().map((L) => {
      const s = statFromModel(L.model);
      return { date: L.meta.date || "", shots: s.shots, miss: s.miss, rate: s.rate, model: L.model };
    });
    const latestRolling = rows.length ? rollingRate(rows, rows.length - 1, 3) : { rate: 0 };
    const prevRolling = rows.length >= 2 ? rollingRate(rows, rows.length - 2, 3) : { rate: null };
    const trend = rows.length >= 2 ? trendInfo(latestRolling.rate, prevRolling.rate, true) : { cls: "", label: "資料累積中", delta: null };
    const clubRows = clubTrendRows(rows).filter((r) => r.latestShots >= 8 && r.latestRate != null);
    const club = clubRows.length ? clubRows.slice().sort((a, b) => clubCoachScore(b) - clubCoachScore(a))[0] : null;
    const event = ((curPlayer || {}).targetEvents || [])[EVENT_INDEX] || ((curPlayer || {}).targetEvents || [])[0] || null;
    const eventText = event ? (event.course || event.title || "目標賽事") + "：" + (eventRiskHoles(event).join("、") || "高風險洞") + " 先保守一級" : "尚未設定目標賽事";
    const title = (latest.meta && latest.meta.date ? latest.meta.date + " " : "") + "自動教練摘要";
    const call = action.priority.title + "｜" + action.priority.body;
    const items = [
      { cls: trend.cls === "bad" ? "warn" : trend.cls === "good" ? "good" : "", t: "穩定性", b: "最新場次失誤率 " + pct(latestStat.rate) + "；近三場 " + pct(latestRolling.rate) + (trend.delta == null ? "，" + trend.label : "，" + trend.label + " " + signedPct(trend.delta)) },
      { cls: club ? "warn" : "", t: "優先球桿", b: club ? club.club + " 最近五次出現失誤率 " + pct(club.latestRate) + "，樣本 " + club.latestShots + " 球" : "目前沒有單支球桿達到優先處理門檻" },
      { cls: event ? "event" : "", t: "賽事提醒", b: eventText },
      { cls: "", t: "資料範圍", b: "目前使用 " + LOADED.length + " 場、" + (ALLMODEL.shots ? ALLMODEL.shots.length : 0) + " 球自動重算" },
    ];
    const practice = (action.practice || []).slice(0, 3);
    const text = [
      title,
      "重點：" + call,
      items.map((it) => it.t + "：" + it.b).join("\n"),
      "下一次練習：",
      practice.map((p, i) => (i + 1) + ". " + p).join("\n"),
    ].join("\n\n");
    return { title, call, items, practice, text };
  }

  function renderPracticeMenu() {
    const el = document.querySelector("#practicemenu");
    if (!el) return;
    if (!LOADED.length || !ALLMODEL || !ALLANALYSIS) {
      el.innerHTML = '<div class="statebox">匯入 CSV 後會自動產生下一次練習菜單。</div>';
      return;
    }
    const menu = buildPracticeMenu();
    el.innerHTML = '<div class="practice-menu"><div class="practice-menu-head"><div><span>RANGE PLAN</span><b>' + esc(menu.title) + '</b></div><strong>' + esc(menu.total) + '</strong></div>' +
      '<div class="practice-menu-grid">' + menu.blocks.map((b, i) =>
        '<div class="practice-block ' + esc(b.cls || "") + '"><div class="practice-block-top"><span>' + String(i + 1).padStart(2, "0") + '</span><b>' + esc(b.title) + '</b><strong>' + esc(b.balls) + '</strong></div><p>' + esc(b.body) + '</p><em>' + esc(b.pass) + '</em></div>'
      ).join("") + '</div></div>';
  }

  function buildPracticeMenu() {
    const action = buildActionCenter();
    const rows = LOADED.slice().reverse().map((L) => {
      const s = statFromModel(L.model);
      return { date: L.meta.date || "", shots: s.shots, miss: s.miss, rate: s.rate, model: L.model };
    });
    const clubRows = clubTrendRows(rows).filter((r) => r.latestShots >= 8 && r.latestRate != null);
    const club = clubRows.length ? clubRows.slice().sort((a, b) => clubCoachScore(b) - clubCoachScore(a))[0] : null;
    const priorityClub = club ? club.club : confidenceDefaultPracticeClub();
    const event = ((curPlayer || {}).targetEvents || [])[EVENT_INDEX] || ((curPlayer || {}).targetEvents || [])[0] || null;
    const eventRisk = event ? eventRiskHoles(event).slice(0, 3).join("、") : "";
    const blocks = [
      {
        cls: "warm",
        title: "熱身校準",
        balls: "10 球",
        body: "W / 9i 半揮到七成，先看起球高度與方向，不追距離。",
        pass: "通過：10 球內至少 7 球能完整收桿，且沒有連續兩球大失誤。",
      },
      {
        cls: "main",
        title: "優先桿品質",
        balls: "20 球",
        body: "主練 " + priorityClub + "。每 5 球一組，只記穩定球與方向，失誤球立刻降速。",
        pass: "通過：任兩組達成 4/5 穩定球；沒通過就不加速。",
      },
      {
        cls: "ladder",
        title: "距離梯控制",
        balls: "18 球",
        body: "選 3 個常用距離：" + practiceDistanceSet() + "。每個距離 6 球，目標放中間。",
        pass: "通過：每個距離至少 4 球落在信心窗附近，短邊失誤不能連續出現。",
      },
      {
        cls: "event",
        title: "球場情境",
        balls: "12 球",
        body: event ? "模擬 " + (event.course || event.title || "目標球場") + " 高風險洞 " + (eventRisk || "指定洞") + "，每球先說策略再打。" : "模擬右/左/短/長四種危險邊，每球先指定安全 miss。",
        pass: "通過：12 球內至少 9 球有明確目標線，爆掉後能立刻改保守打法。",
      },
    ];
    return { title: "下一次 60 球練習菜單", total: "60 球", blocks, source: action.priority.title };
  }

  function confidenceDefaultPracticeClub() {
    if (MODEL && MODEL.clubs) {
      const candidates = ["7i", "8i", "9i", "W", "6i"].filter((c) => MODEL.clubs[c]);
      if (candidates.length) return candidates[0];
    }
    return "7i";
  }

  function practiceDistanceSet() {
    if (!MODEL || !MODEL.clubs) return "100 / 120 / 150y";
    const vals = ["W", "9i", "7i"].map((c) => MODEL.clubs[c] && MODEL.clubs[c].carry).filter(Boolean);
    if (vals.length >= 3) return vals.map((v) => Math.round(v) + "y").join(" / ");
    return "100 / 120 / 150y";
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
    const home = document.querySelector("#homeaction");
    if (!el && !home) return;
    if (!LOADED.length || !ALLMODEL || !ALLANALYSIS) {
      const empty = '<div class="statebox">匯入 CSV 後會自動產生本週練習優先順序。</div>';
      if (el) el.innerHTML = empty;
      if (home) home.innerHTML = empty;
      return;
    }
    const data = buildActionCenter();
    if (home) home.innerHTML = actionCenterHTML(data, true);
    if (el) el.innerHTML = actionCenterHTML(data, false);
  }

  function actionCenterHTML(data, compact) {
    const priority = data.priority;
    let h = '<div class="action-grid"><div class="action-hero ' + esc(priority.cls) + '">';
    h += '<div class="action-eyebrow">' + esc(priority.category || "Action Center") + '</div>';
    h += '<div class="action-title">' + esc(priority.title) + "</div>";
    h += '<div class="action-body">' + esc(priority.body) + "</div>";
    h += '<div class="action-metrics"><span>近三場失誤率 <b>' + pct(data.metrics.latestRate) + '</b></span><span>優先桿 <b>' + esc(data.metrics.club || "—") + '</b></span><span>目標賽事 <b>' + esc(data.metrics.event || "—") + '</b></span></div>';
    if (compact) {
      h += decisionGridHTML(data);
      h += "</div></div>";
      return h;
    }
    h += '</div><div class="action-side"><div class="action-side-title">本週 3 件事</div>';
    data.practice.forEach((item, i) => {
      h += '<div class="action-task"><span class="num">' + (i + 1) + "</span><p>" + esc(item) + "</p></div>";
    });
    h += "</div></div>";
    h += '<div class="action-event"><b>' + esc(data.event.title) + "</b><span>" + esc(data.event.body) + "</span></div>";
    return h;
  }

  function decisionGridHTML(data) {
    const cards = [
      { cls: data.priority.cls === "urgent" ? "warn" : "good", t: "目前狀態", b: "近三場失誤率 " + pct(data.metrics.latestRate) + "，" + (data.metrics.trend || "持續累積樣本") },
      { cls: data.metrics.club ? "warn" : "", t: "最大問題", b: data.metrics.club ? "先處理 " + data.metrics.club + " 的穩定性" : "目前沒有單支球桿樣本異常" },
      { cls: "", t: "下一步", b: (data.practice && data.practice[0]) || "固定熱身流程，先建立可重複性" },
    ];
    return '<div class="decision-grid">' + cards.map((c) => '<div class="decision-card ' + c.cls + '"><b>' + esc(c.t) + '</b><span>' + esc(c.b) + "</span></div>").join("") + "</div>";
  }

  function renderConfidenceCard() {
    const el = document.querySelector("#confidence-card");
    if (!el) return;
    if (!MODEL || !MODEL.order.length) {
      el.innerHTML = '<div class="statebox">匯入球桿距離資料後，會自動建立拿桿建議。</div>';
      return;
    }
    const pin = confidencePinPositions().find((p) => p.id === PIN_POSITION) || confidencePinPositions()[1];
    const lie = confidenceLieOptions().find((l) => l.id === BALL_LIE) || confidenceLieOptions()[0];
    const hazard = confidenceHazardOptions().find((h) => h.id === HAZARD_SIDE) || confidenceHazardOptions()[0];
    const playDistance = clamp(TARGET_DISTANCE + PLAYING_ADJUST + pin.adjust, 1, 320);
    const data = confidenceData(MODEL, playDistance, CONFIDENCE_MODE, BALL_LIE, HAZARD_SIDE);
    const main = data.main;
    const alt = data.alt;
    const command = confidenceCommand(main, CONFIDENCE_MODE, PLAYING_ADJUST, pin, lie, hazard);
    el.innerHTML =
      '<div class="confidence confidence-view-' + esc(CONFIDENCE_VIEW) + (COURSE_MODE ? " confidence-course-mode" : "") + '">' +
      confidenceCourseModeToggleHTML() +
      (COURSE_MODE ? confidenceCourseModeHTML(main, alt, playDistance, data, pin, lie, hazard, command) : "") +
      '<div class="confidence-top"><div class="confidence-copy"><b>剩餘 ' + TARGET_DISTANCE + ' 碼進攻' + (PLAYING_ADJUST || pin.adjust ? " → 實戰 " + playDistance + " 碼" : "") + '</b><span>以穩定球 carry 判斷，不追極限距離；差點高時優先選擇「可重複打到」的桿。</span></div>' +
      '<label class="confidence-input"><input id="target-distance" type="number" min="' + data.min + '" max="' + data.max + '" step="1" value="' + TARGET_DISTANCE + '"><span>碼</span></label></div>' +
      '<input class="confidence-range" id="target-distance-range" type="range" min="' + data.min + '" max="' + data.max + '" step="1" value="' + TARGET_DISTANCE + '">' +
      '<div class="confidence-view-toggle">' + confidenceViewOptions().map((v) => '<button type="button" data-view="' + v.id + '" class="' + (v.id === CONFIDENCE_VIEW ? "on" : "") + '">' + esc(v.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-presets">' + confidencePresets().map((p) => '<button type="button" data-preset="' + p.id + '" class="' + (p.id === activeConfidencePreset() ? "active" : "") + '" title="' + esc(p.note) + '">' + esc(p.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-preset-note">' + esc(confidencePresetNote()) + "</div>" +
      '<div class="confidence-scenarios">' + confidenceScenarios().map((s) => '<button type="button" data-scenario="' + s.id + '" class="' + (s.id === activeConfidenceScenario() ? "active" : "") + '" title="' + esc(s.note) + '"><b>' + esc(s.label) + '</b><span>' + esc(s.short) + '</span></button>').join("") + "</div>" +
      '<div class="confidence-scenario-note">' + esc(confidenceScenarioNote()) + "</div>" +
      '<div class="confidence-mode">' + confidenceModes().map((m) => '<button type="button" data-mode="' + m.id + '" class="' + (m.id === CONFIDENCE_MODE ? "on" : "") + '">' + esc(m.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-adjust">' + confidenceAdjustments().map((a) => '<button type="button" data-adjust="' + a.v + '" class="' + (a.v === PLAYING_ADJUST ? "on" : "") + '">' + esc(a.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-pin">' + confidencePinPositions().map((p) => '<button type="button" data-pin="' + p.id + '" class="' + (p.id === PIN_POSITION ? "on" : "") + '">' + esc(p.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-lie">' + confidenceLieOptions().map((l) => '<button type="button" data-lie="' + l.id + '" class="' + (l.id === BALL_LIE ? "on" : "") + '">' + esc(l.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-hazard">' + confidenceHazardOptions().map((h) => '<button type="button" data-hazard="' + h.id + '" class="' + (h.id === HAZARD_SIDE ? "on" : "") + '">' + esc(h.label) + "</button>").join("") + "</div>" +
      '<div class="confidence-toolrow"><span class="confidence-context">' + esc(confidenceContextText(pin, lie, hazard)) + '</span><button class="confidence-reset" type="button">回到預設</button></div>' +
      '<div class="confidence-quick">' + data.quick.map((q) => '<button type="button" data-distance="' + q + '" class="' + (q === TARGET_DISTANCE ? "on" : "") + '">' + q + "y</button>").join("") + "</div>" +
      confidencePinnedHTML(data.min, data.max, CONFIDENCE_MODE, BALL_LIE, HAZARD_SIDE) +
      confidenceRecentHTML(data.min, data.max) +
      '<div class="confidence-command" data-command="' + esc(command) + '"><b>Caddie Call</b><span>' + esc(command) + '</span><button class="confidence-copy-call" type="button">複製</button></div>' +
      confidenceNoteHTML(main, alt, playDistance, hazard, pin) +
      confidenceDashboardHTML(main, playDistance) +
      confidenceNextShotHTML(main, alt, playDistance, hazard, pin) +
      confidenceDistanceBandHTML(main, alt, playDistance) +
      confidenceBriefHTML(main, playDistance) +
      confidenceWindowHTML(main, playDistance) +
      confidenceBudgetHTML(main, playDistance) +
      confidenceLightHTML(main) +
      confidenceAimHTML(main) +
      confidenceLandingHTML(main, playDistance, hazard, pin) +
      '<div class="confidence-picks"><div class="confidence-main"><b>首選進攻桿</b><strong>' + esc(main.club) + '</strong><span>' + esc(main.reason) + '</span>' + confidenceScoreHTML(main) + confidenceMicroHTML(main) + '<i class="confidence-pill ' + main.confidence.cls + '">' + esc(main.confidence.label) + '</i></div>' +
      '<div class="confidence-alt"><b>保守備用</b><span>' + esc(alt ? alt.club + "：" + alt.reason : "目前沒有合適備用桿；先用短一支桿保守上球道。") + '</span></div></div>' +
      confidenceTradeoffHTML(main, alt, playDistance) +
      confidenceCompareHTML(data.candidates) +
      confidenceLadderHTML(data.ladder) +
      confidencePocketHTML(data.pocket) +
      confidenceClubCardsHTML(data.clubCards) +
      '<div class="confidence-plan"><b>' + esc(main.plan.title) + '</b><span>' + esc(main.plan.body) + '</span></div>' +
      '<div class="confidence-checks">' + main.checks.map((c) => '<div class="confidence-check"><b>' + esc(c.t) + '</b><span>' + esc(c.b) + '</span></div>').join("") + "</div>" +
      '<div class="confidence-matrix">' + data.matrix.map((m) => '<button class="confidence-tile ' + m.cls + '" type="button" data-distance="' + m.distance + '"><b>' + m.distance + 'y</b><strong>' + esc(m.club) + '</strong><span>' + esc(m.gapText) + ' · 信心 ' + m.score + "/100</span></button>").join("") + "</div>" +
      '<div class="confidence-bands">' + data.bands.map((b) => '<span class="confidence-band">' + esc(b.club) + " " + b.low + "-" + b.high + "y</span>").join("") + "</div></div>";
    bindConfidenceInputs();
    renderFieldDock();
  }

  function confidenceCourseModeToggleHTML() {
    return '<div class="course-mode-toggle" role="group" aria-label="信心卡模式">' +
      '<button type="button" data-course-mode="on" class="' + (COURSE_MODE ? "on" : "") + '">下場模式</button>' +
      '<button type="button" data-course-mode="off" class="' + (!COURSE_MODE ? "on" : "") + '">分析模式</button>' +
      '</div>';
  }

  function confidenceCourseModeHTML(main, alt, playDistance, data, pin, lie, hazard, command) {
    if (!main || main.club === "—") return "";
    const light = confidenceTrafficLight(main);
    const band = confidenceDistanceBandParts(main, alt, playDistance);
    const aim = main.aim && main.aim.call ? main.aim.call : "瞄中間";
    const altText = alt && alt.club ? alt.club : "短一支";
    return '<div class="course-card ' + esc(light.cls) + '">' +
      '<div class="course-card-head"><span>FIELD MODE</span><b>' + esc(light.label) + '</b></div>' +
      '<div class="course-main">' +
        '<label><span>剩餘</span><input id="course-distance" type="number" min="' + data.min + '" max="' + data.max + '" step="1" value="' + TARGET_DISTANCE + '"><small>碼</small></label>' +
        '<div><strong>拿 ' + esc(main.club) + '</strong><em>備用 ' + esc(altText) + '｜' + esc(band.title) + '</em></div>' +
      '</div>' +
      '<div class="course-call"><b>' + esc(aim) + '</b><span>' + esc(band.rule) + '</span></div>' +
      '<div class="course-mini">' +
        '<span><b>' + esc(String(main.confidence.score || 0)) + '</b><small>信心</small></span>' +
        '<span><b>' + esc(main.window.low + "-" + main.window.high) + '</b><small>信心窗</small></span>' +
        '<span><b>' + esc(playDistance + "y") + '</b><small>實戰距離</small></span>' +
      '</div>' +
      '<div class="course-stepper">' + [-10, -5, 5, 10].map((v) => '<button class="course-step" type="button" data-step="' + v + '">' + (v > 0 ? "+" : "") + v + '</button>').join("") + '<button class="course-copy" type="button" data-command="' + esc(command) + '">複製口令</button></div>' +
      '<div class="course-controls">' +
        '<div class="course-chipline course-pin">' + confidencePinPositions().map((p) => '<button type="button" data-pin="' + p.id + '" class="' + (p.id === pin.id ? "on" : "") + '">' + esc(p.shortLabel || p.label.replace(" -5", "").replace(" +5", "")) + '</button>').join("") + '</div>' +
        '<div class="course-chipline course-lie">' + confidenceLieOptions().map((l) => '<button type="button" data-lie="' + l.id + '" class="' + (l.id === lie.id ? "on" : "") + '">' + esc(l.shortLabel || l.label) + '</button>').join("") + '</div>' +
        '<div class="course-chipline course-hazard">' + confidenceHazardOptions().map((h) => '<button type="button" data-hazard="' + h.id + '" class="' + (h.id === hazard.id ? "on" : "") + '">' + esc(h.shortLabel || h.label) + '</button>').join("") + '</div>' +
      '</div>' +
      '</div>';
  }

  function bindConfidenceInputs() {
    const input = document.querySelector("#target-distance");
    const range = document.querySelector("#target-distance-range");
    const update = (v, remember) => {
      const n = clamp(Math.round(Number(v) || TARGET_DISTANCE), Number(input.min), Number(input.max));
      if (remember) rememberRecentDistance(n, Number(input.min), Number(input.max));
      if (n === TARGET_DISTANCE) return;
      TARGET_DISTANCE = n;
      renderConfidenceCard();
    };
    if (input) input.addEventListener("change", () => update(input.value, true));
    if (range) input.addEventListener("input", () => { if (range) range.value = input.value; });
    if (range) range.addEventListener("input", () => update(range.value, false));
    if (range) range.addEventListener("change", () => update(range.value, true));
    const courseInput = document.querySelector("#course-distance");
    if (courseInput) courseInput.addEventListener("change", () => update(courseInput.value, true));
    if (courseInput) courseInput.addEventListener("input", () => { if (input) input.value = courseInput.value; if (range) range.value = courseInput.value; });
    document.querySelectorAll(".course-step").forEach((b) => {
      b.addEventListener("click", () => update(TARGET_DISTANCE + (Number(b.dataset.step) || 0), true));
    });
    document.querySelectorAll(".course-mode-toggle button").forEach((b) => {
      b.addEventListener("click", () => {
        COURSE_MODE = b.dataset.courseMode === "on";
        saveCourseMode(COURSE_MODE);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".course-pin button").forEach((b) => {
      b.addEventListener("click", () => {
        PIN_POSITION = normalizePinPosition(b.dataset.pin);
        savePinPosition(PIN_POSITION);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".course-lie button").forEach((b) => {
      b.addEventListener("click", () => {
        BALL_LIE = normalizeLie(b.dataset.lie);
        saveBallLie(BALL_LIE);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".course-hazard button").forEach((b) => {
      b.addEventListener("click", () => {
        HAZARD_SIDE = normalizeHazardSide(b.dataset.hazard);
        saveHazardSide(HAZARD_SIDE);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-quick button").forEach((b) => {
      b.addEventListener("click", () => update(b.dataset.distance, true));
    });
    document.querySelectorAll(".confidence-view-toggle button").forEach((b) => {
      b.addEventListener("click", () => {
        CONFIDENCE_VIEW = normalizeConfidenceView(b.dataset.view);
        saveConfidenceView(CONFIDENCE_VIEW);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-tile,.confidence-ladder-row,.confidence-pocket-card,.confidence-clubcard,.confidence-recent button[data-distance],.confidence-pinned button[data-distance]").forEach((b) => {
      b.addEventListener("click", () => update(b.dataset.distance, true));
    });
    const clearRecent = document.querySelector(".confidence-recent-clear");
    if (clearRecent) clearRecent.addEventListener("click", () => { clearRecentDistances(); renderConfidenceCard(); });
    const pinDistance = document.querySelector(".confidence-pin-distance");
    if (pinDistance) pinDistance.addEventListener("click", () => { togglePinnedDistance(TARGET_DISTANCE, Number(input.min), Number(input.max)); renderConfidenceCard(); });
    document.querySelectorAll(".confidence-presets button").forEach((b) => {
      b.addEventListener("click", () => {
        applyConfidencePreset(b.dataset.preset);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-scenarios button").forEach((b) => {
      b.addEventListener("click", () => {
        applyConfidenceScenario(b.dataset.scenario);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-mode button").forEach((b) => {
      b.addEventListener("click", () => {
        CONFIDENCE_MODE = normalizeConfidenceMode(b.dataset.mode);
        saveConfidenceMode(CONFIDENCE_MODE);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-adjust button").forEach((b) => {
      b.addEventListener("click", () => {
        PLAYING_ADJUST = clamp(Math.round(Number(b.dataset.adjust) || 0), -20, 20);
        savePlayingAdjust(PLAYING_ADJUST);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-pin button").forEach((b) => {
      b.addEventListener("click", () => {
        PIN_POSITION = normalizePinPosition(b.dataset.pin);
        savePinPosition(PIN_POSITION);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-lie button").forEach((b) => {
      b.addEventListener("click", () => {
        BALL_LIE = normalizeLie(b.dataset.lie);
        saveBallLie(BALL_LIE);
        renderConfidenceCard();
      });
    });
    document.querySelectorAll(".confidence-hazard button").forEach((b) => {
      b.addEventListener("click", () => {
        HAZARD_SIDE = normalizeHazardSide(b.dataset.hazard);
        saveHazardSide(HAZARD_SIDE);
        renderConfidenceCard();
      });
    });
    const copy = document.querySelector(".confidence-copy-call");
    if (copy) {
      copy.addEventListener("click", () => copyConfidenceCommand(copy));
    }
    const noteCopy = document.querySelector(".confidence-note-copy");
    if (noteCopy) {
      noteCopy.addEventListener("click", () => copyConfidenceNote(noteCopy));
    }
    const courseCopy = document.querySelector(".course-copy");
    if (courseCopy) {
      courseCopy.addEventListener("click", () => copyCourseCommand(courseCopy));
    }
    const reset = document.querySelector(".confidence-reset");
    if (reset) {
      reset.addEventListener("click", () => {
        applyConfidencePreset("reset");
        renderConfidenceCard();
      });
    }
  }

  async function copyConfidenceCommand(button) {
    const box = button && button.closest(".confidence-command");
    const text = box ? box.dataset.command || "" : "";
    if (!text) return;
    try {
      await writeClipboardText(text);
      button.textContent = "已複製";
      button.classList.add("done");
      setTimeout(() => {
        button.textContent = "複製";
        button.classList.remove("done");
      }, 1200);
    } catch (e) {
      selectConfidenceCommand(box);
      button.textContent = "已選取";
      setTimeout(() => { button.textContent = "複製"; }, 1200);
    }
  }

  async function copyConfidenceNote(button) {
    const box = button && button.closest(".confidence-note");
    const text = box ? box.dataset.note || "" : "";
    if (!text) return;
    try {
      await writeClipboardText(text);
      button.textContent = "已複製";
      button.classList.add("done");
      setTimeout(() => {
        button.textContent = "複製口令";
        button.classList.remove("done");
      }, 1200);
    } catch (e) {
      button.textContent = "失敗";
      setTimeout(() => { button.textContent = "複製口令"; }, 1200);
    }
  }

  async function copyCourseCommand(button) {
    const text = button ? button.dataset.command || "" : "";
    if (!text) return;
    try {
      await writeClipboardText(text);
      button.textContent = "已複製";
      button.classList.add("done");
      setTimeout(() => {
        button.textContent = "複製口令";
        button.classList.remove("done");
      }, 1200);
    } catch (e) {
      button.textContent = "失敗";
      setTimeout(() => { button.textContent = "複製口令"; }, 1200);
    }
  }

  function selectConfidenceCommand(box) {
    const text = box && box.querySelector("span");
    if (!text || !window.getSelection || !document.createRange) return;
    const range = document.createRange();
    range.selectNodeContents(text);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function writeClipboardText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (e) { /* fallback below */ }
    }
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.left = "-9999px";
    t.style.top = "0";
    document.body.appendChild(t);
    t.focus();
    t.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(t);
    if (!ok) throw new Error("copy failed");
  }

  function renderFieldDock() {
    const el = document.querySelector("#field-dock");
    if (!el) return;
    if (!MODEL || !MODEL.order || !MODEL.order.length) {
      el.classList.remove("show");
      el.innerHTML = "";
      return;
    }
    const pin = confidencePinPositions().find((p) => p.id === PIN_POSITION) || confidencePinPositions()[1];
    const lie = confidenceLieOptions().find((l) => l.id === BALL_LIE) || confidenceLieOptions()[0];
    const hazard = confidenceHazardOptions().find((h) => h.id === HAZARD_SIDE) || confidenceHazardOptions()[0];
    const playDistance = clamp(TARGET_DISTANCE + PLAYING_ADJUST + pin.adjust, 1, 320);
    const data = confidenceData(MODEL, playDistance, CONFIDENCE_MODE, BALL_LIE, HAZARD_SIDE);
    const main = data.main;
    if (!main || main.club === "—") {
      el.classList.remove("show");
      el.innerHTML = "";
      return;
    }
    const command = confidenceCommand(main, CONFIDENCE_MODE, PLAYING_ADJUST, pin, lie, hazard);
    const light = confidenceTrafficLight(main);
    const brief = confidenceBriefParts(main, playDistance);
    const context = [
      light.label,
      brief.aim,
      brief.miss,
      pin.id === "middle" ? "" : pin.label.replace(" -5", "").replace(" +5", ""),
      lie.id === "fairway" ? "" : lie.label,
      hazard.id === "none" ? "" : hazard.label,
      PLAYING_ADJUST ? (PLAYING_ADJUST > 0 ? "+" : "") + PLAYING_ADJUST + "y" : "",
    ].filter(Boolean).join(" · ");
    el.innerHTML =
      '<div class="field-dock-inner">' +
        '<button class="field-dock-main" type="button" data-dock-focus="confidence">' +
          '<span>' + playDistance + 'y</span><b>拿 ' + esc(main.club) + '｜信心 ' + (main.confidence.score || 0) + '/100</b><small>' + esc(context) + '</small>' +
        '</button>' +
        '<div class="field-dock-actions">' +
          '<button type="button" data-dock-step="-5">-5</button>' +
          '<button type="button" data-dock-step="5">+5</button>' +
          '<button class="primary" type="button" data-dock-copy="' + esc(command) + '">複製</button>' +
        '</div>' +
      '</div>';
    el.classList.add("show");
    bindFieldDock(data);
  }

  function bindFieldDock(data) {
    const focus = document.querySelector('[data-dock-focus="confidence"]');
    if (focus) {
      focus.addEventListener("click", () => {
        setTab("data");
        const card = document.querySelector("#confidence-card");
        if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    document.querySelectorAll("[data-dock-step]").forEach((b) => {
      b.addEventListener("click", () => {
        const step = Math.round(Number(b.dataset.dockStep) || 0);
        TARGET_DISTANCE = clamp(TARGET_DISTANCE + step, data.min || 30, data.max || 260);
        rememberRecentDistance(TARGET_DISTANCE, data.min || 30, data.max || 260);
        renderConfidenceCard();
      });
    });
    const copy = document.querySelector("[data-dock-copy]");
    if (copy) {
      copy.addEventListener("click", async () => {
        const text = copy.dataset.dockCopy || "";
        if (!text) return;
        try {
          await writeClipboardText(text);
          copy.textContent = "已複製";
          copy.classList.add("done");
          setTimeout(() => {
            copy.textContent = "複製";
            copy.classList.remove("done");
          }, 1200);
        } catch (e) {
          copy.textContent = "失敗";
          setTimeout(() => { copy.textContent = "複製"; }, 1200);
        }
      });
    }
  }

  function confidenceData(M, target, mode, lie, hazard) {
    mode = normalizeConfidenceMode(mode);
    lie = normalizeLie(lie);
    hazard = normalizeHazardSide(hazard);
    const rows = confidenceRows(M, target, mode, lie, hazard);
    if (!rows.length) {
      return {
        min: 30,
        max: 240,
        main: { club: "—", confidence: { cls: "low", label: "資料不足", score: 0 }, metrics: [], reason: "目前沒有足夠的穩定球距離可判斷。", plan: { title: "先保守", body: "沒有資料時不要硬攻旗桿，選能安全前進的桿。" }, checks: fallbackConfidenceChecks() },
        alt: null,
        quick: [80, 100, 120, 140, 150, 170],
        matrix: [],
        ladder: [],
        pocket: [],
        clubCards: [],
        bands: [],
      };
    }
    const min = Math.max(30, Math.min.apply(null, rows.map((r) => r.low)) - 10);
    const max = Math.max.apply(null, rows.map((r) => r.high)) + 10;
    const main = rows[0] || { club: "—", o: {}, low: 0, high: 0, diff: 0 };
    const alt = rows.find((r) => r.club !== main.club && r.o.carry <= main.o.carry) || rows.find((r) => r.club !== main.club) || null;
    const quick = confidenceQuickDistances(rows, min, max);
    return {
      min,
      max,
      main: confidencePick(main, target, true, mode),
      alt: alt ? confidencePick(alt, target, false, mode) : null,
      quick,
      candidates: rows.slice(0, 3).map((r, i) => confidenceCandidate(r, target, mode, i === 0)),
      matrix: confidenceMatrix(M, mode, quick, lie, hazard),
      ladder: confidenceDecisionLadder(M, mode, quick, lie, hazard),
      pocket: confidencePocketCards(M, mode, lie, hazard),
      clubCards: confidenceClubCards(M, mode, lie, hazard),
      bands: rows.slice().sort((a, b) => b.o.carry - a.o.carry).map((r) => ({ club: r.club, low: r.low, high: r.high })),
    };
  }

  function confidenceRows(M, target, mode, lie, hazard) {
    mode = normalizeConfidenceMode(mode);
    lie = normalizeLie(lie);
    hazard = normalizeHazardSide(hazard);
    return M.order
      .filter((c) => M.clubs[c] && M.clubs[c].carry > 0)
      .map((c) => {
        const o = M.clubs[c];
        const rawSpan = Math.round((o.carry_max - o.carry_min) / 2);
        const span = clamp(Math.max(5, Math.round(o.total_std || rawSpan || 8)), 6, 16);
        const low = Math.max(1, Math.round(o.carry - span));
        const high = Math.round(o.carry + span);
        const diff = Math.abs(o.carry - target);
        const inBand = target >= low && target <= high;
        const isWood = !!WOODS[c];
        const woodPenalty = isWood && target < 170 ? (c === "3H" ? 8 : 28) : isWood && target < 195 ? 10 : 0;
        const risk = Math.max(0, o.mishit_rate || 0) + (o.n_used < 6 ? 18 : 0);
        const gap = o.carry - target;
        const modePenalty = confidenceModePenalty(mode, gap, risk, isWood, target);
        const liePenalty = confidenceLiePenalty(lie, c, isWood, target);
        const hazardPenalty = confidenceHazardPenalty(hazard, gap, o);
        return { club: c, o, low, high, diff, inBand, score: diff + risk * 0.35 + woodPenalty + modePenalty + liePenalty + hazardPenalty + (inBand ? -5 : 0), mode };
      })
      .sort((a, b) => a.score - b.score);
  }

  function confidenceMatrix(M, mode, distances, lie, hazard) {
    return distances.slice(0, 8).map((d) => {
      const row = confidenceRows(M, d, mode, lie, hazard)[0];
      if (!row) return { distance: d, club: "—", score: 0, cls: "low", gapText: "資料不足" };
      const pick = confidencePick(row, d, true, mode);
      return { distance: d, club: pick.club, score: pick.confidence.score || 0, cls: pick.confidence.cls || "low", gapText: confidenceGapText(row.o.carry - d) };
    });
  }

  function confidenceDecisionLadder(M, mode, distances, lie, hazard) {
    return distances.slice(0, 8).map((d) => {
      const rows = confidenceRows(M, d, mode, lie, hazard);
      const main = rows[0];
      const alt = rows.find((r) => main && r.club !== main.club && r.o.carry <= main.o.carry) || rows.find((r) => main && r.club !== main.club) || null;
      if (!main) return { distance: d, club: "—", alt: "—", light: { cls: "stop", label: "LAY" }, gap: "資料不足", room: "—", aim: "—" };
      const pick = confidencePick(main, d, true, mode);
      const light = confidenceTrafficLight(pick);
      const room = confidenceBudgetParts(pick, d).find((p) => p.label === "總容錯");
      return {
        distance: d,
        club: pick.club,
        alt: alt ? alt.club : "—",
        light,
        gap: confidenceGapText(Math.round(main.o.carry - d)),
        room: room ? room.value : "—",
        aim: pick.aim ? pick.aim.label : "瞄中間",
      };
    });
  }

  function confidenceLadderHTML(rows) {
    rows = rows || [];
    if (!rows.length) return "";
    return '<div class="confidence-ladder"><div class="confidence-ladder-title"><b>距離階梯拿桿帶</b><span>快速掃碼數：首選 / 備用 / 進攻燈號</span></div>' +
      rows.map((r) =>
        '<button class="confidence-ladder-row" type="button" data-distance="' + r.distance + '">' +
          '<span class="confidence-ladder-distance">' + r.distance + 'y</span>' +
          '<strong>' + esc(r.club) + '</strong>' +
          '<small>備 ' + esc(r.alt) + ' · ' + esc(r.gap) + ' · 容錯 ' + esc(r.room) + ' · ' + esc(r.aim) + '</small>' +
          '<i class="' + esc(r.light.cls) + '">' + esc(r.light.label) + '</i>' +
        '</button>'
      ).join("") + "</div>";
  }

  function confidencePocketCards(M, mode, lie, hazard) {
    const baseRows = confidenceRows(M, 150, mode, lie, hazard);
    if (!baseRows.length) return [];
    const ranges = confidencePocketRanges(baseRows);
    return ranges.map((r) => {
      const mid = Math.round((r.low + r.high) / 2);
      const rows = confidenceRows(M, mid, mode, lie, hazard);
      const main = rows[0];
      const alt = rows.find((x) => main && x.club !== main.club && x.o.carry <= main.o.carry) || rows.find((x) => main && x.club !== main.club) || null;
      if (!main) return null;
      const pick = confidencePick(main, mid, true, mode);
      const light = confidenceTrafficLight(pick);
      const budget = confidenceBudgetParts(pick, mid).find((p) => p.label === "總容錯");
      return {
        low: r.low,
        high: r.high,
        mid,
        club: pick.club,
        alt: alt ? alt.club : "—",
        light,
        score: pick.confidence.score || 0,
        room: budget ? budget.value : "—",
        tip: confidencePocketTip(pick, light, r),
      };
    }).filter(Boolean);
  }

  function confidencePocketRanges(rows) {
    const lows = rows.map((r) => r.low).filter((v) => Number.isFinite(v));
    const highs = rows.map((r) => r.high).filter((v) => Number.isFinite(v));
    const min = Math.max(40, Math.floor((Math.min.apply(null, lows) - 4) / 10) * 10);
    const max = Math.min(230, Math.ceil((Math.max.apply(null, highs) + 4) / 10) * 10);
    const ranges = [];
    for (let low = min; low < max; low += 20) {
      ranges.push({ low, high: Math.min(max, low + 20) });
    }
    return ranges.slice(0, 8);
  }

  function confidencePocketTip(pick, light, range) {
    if (!pick || !pick.aim) return "目標放安全區，不硬攻旗";
    if (light.cls === "go") return pick.aim.call + "，正常節奏";
    if (light.cls === "caution") return "只打到 " + range.low + "-" + range.high + "y 的中間，不追旗";
    return "LAY：先安全推進，留下一桿好切";
  }

  function confidencePocketHTML(cards) {
    cards = cards || [];
    if (!cards.length) return "";
    return '<div class="confidence-pocket"><div class="confidence-pocket-title"><b>口袋距離卡</b><span>不用輸入，直接看區間拿桿</span></div><div class="confidence-pocket-grid">' +
      cards.map((c) =>
        '<button class="confidence-pocket-card" type="button" data-distance="' + c.mid + '">' +
          '<span>' + c.low + "-" + c.high + 'y</span><strong>' + esc(c.club) + '</strong>' +
          '<small>備 ' + esc(c.alt) + ' · 信心 ' + c.score + ' · 容錯 ' + esc(c.room) + '</small>' +
          '<i class="' + esc(c.light.cls) + '">' + esc(c.light.label) + '</i><em>' + esc(c.tip) + '</em>' +
        '</button>'
      ).join("") + "</div></div>";
  }

  function confidenceClubCards(M, mode, lie, hazard) {
    if (!M || !M.order || !M.order.length) return [];
    return M.order
      .filter((c) => M.clubs[c] && M.clubs[c].carry > 0)
      .map((c) => {
        const row = confidenceRows(M, M.clubs[c].carry, mode, lie, hazard).find((r) => r.club === c);
        if (!row) return null;
        const pick = confidencePick(row, M.clubs[c].carry, true, mode);
        const light = confidenceTrafficLight(pick);
        const safeLow = Math.max(1, Math.round(row.low + 2));
        const safeHigh = Math.max(safeLow, Math.round(row.high - 2));
        return {
          club: c,
          cls: light.cls,
          light: light.label,
          score: pick.confidence.score || 0,
          carry: Math.round(row.o.carry || 0),
          comfort: safeLow + "-" + safeHigh + "y",
          attack: Math.round(row.low) + "-" + Math.round(row.high) + "y",
          safe: Math.max(1, Math.round(row.low - 8)) + "-" + Math.round(row.low + 3) + "y",
          miss: confidenceClubMissText(row),
          avoid: confidenceClubAvoidText(row),
          sample: (row.o.n_used || 0) + "/" + (row.o.n_total || 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.carry - a.carry);
  }

  function confidenceClubMissText(row) {
    const o = row.o || {};
    const left = o.n_left || 0;
    const right = o.n_right || 0;
    if ((o.mishit_rate || 0) >= 40) return "失誤偏高，先當保守推進桿";
    if (right >= left * 1.5 && right - left >= 2) return "常見 miss：右側";
    if (left >= right * 1.5 && left - right >= 2) return "常見 miss：左側";
    if ((o.total_std || 0) >= 18) return "距離波動較大";
    return "方向相對均衡";
  }

  function confidenceClubAvoidText(row) {
    const o = row.o || {};
    const isWood = !!WOODS[row.club];
    if ((o.n_used || 0) < 6) return "樣本少，不打關鍵旗位";
    if ((o.mishit_rate || 0) >= 35) return "短邊或 OB 邊不要硬攻";
    if (isWood && (o.total_std || 0) >= 20) return "窄球道與強制 carry 先避開";
    if ((o.carry_max || 0) - (o.carry_min || 0) >= 28) return "前後障礙很近時少用";
    return "正常使用，目標放中間";
  }

  function confidenceClubCardsHTML(cards) {
    cards = cards || [];
    if (!cards.length) return "";
    return '<div class="confidence-clubcards"><div class="confidence-clubcards-title"><b>球桿信任卡</b><span>每支桿的舒適距離、進攻區與不要硬攻的情境</span></div><div class="confidence-clubcards-grid">' +
      cards.map((c) =>
        '<button class="confidence-clubcard ' + esc(c.cls) + '" type="button" data-distance="' + c.carry + '">' +
          '<div class="confidence-clubcard-top"><strong>' + esc(c.club) + '</strong><i>' + esc(c.light) + '</i></div>' +
          '<div class="confidence-clubcard-carry"><b>' + c.carry + 'y</b><span>平均 carry</span></div>' +
          '<div class="confidence-clubcard-ranges"><span><b>' + esc(c.comfort) + '</b><small>舒適</small></span><span><b>' + esc(c.attack) + '</b><small>可攻</small></span><span><b>' + esc(c.safe) + '</b><small>保守</small></span></div>' +
          '<p>' + esc(c.miss) + '</p><em>' + esc(c.avoid) + '｜樣本 ' + esc(c.sample) + '｜信心 ' + c.score + '</em>' +
        '</button>'
      ).join("") + '</div></div>';
  }

  function confidencePick(r, target, primary, mode) {
    const c = confidenceLevel(r);
    const gap = Math.round(r.o.carry - target);
    const direction = gap === 0 ? "剛好對到目標距離" : gap > 0 ? "平均會多 " + gap + " 碼" : "平均會短 " + Math.abs(gap) + " 碼";
    const sample = "採用 " + (r.o.n_used || 0) + "/" + (r.o.n_total || 0) + " 球，失誤率 " + (r.o.mishit_rate || 0) + "%";
    return {
      club: r.club,
      confidence: c,
      metrics: confidenceMetrics(r, target),
      plan: confidencePlan(r, target, c, mode),
      checks: confidenceChecks(r, target, mode),
      aim: confidenceAimAdvice(r, mode),
      window: { low: r.low, high: r.high },
      reason: (primary ? direction + "；" : "") + "信心區間 " + r.low + "-" + r.high + " 碼，" + sample + "。",
    };
  }

  function confidenceCandidate(r, target, mode, best) {
    const pick = confidencePick(r, target, true, mode);
    return {
      club: r.club,
      best,
      score: pick.confidence.score || 0,
      cls: pick.confidence.cls || "low",
      gap: confidenceGapText(Math.round(r.o.carry - target)),
      miss: (r.o.mishit_rate || 0) + "%",
      sample: (r.o.n_used || 0) + "/" + (r.o.n_total || 0),
      band: r.low + "-" + r.high + "y",
      aim: confidenceAimAdvice(r, mode).label,
    };
  }

  function confidenceCompareHTML(rows) {
    rows = rows || [];
    if (!rows.length) return "";
    return '<div class="confidence-compare">' + rows.map((r) =>
      '<div class="confidence-compare-row ' + (r.best ? "best" : "") + '"><b>' + esc(r.club) + '</b><span>' +
      esc(r.gap + " · " + r.aim + " · 區間 " + r.band + " · 失誤 " + r.miss + " · 樣本 " + r.sample) +
      '</span><strong>' + esc(String(r.score)) + '/100</strong></div>'
    ).join("") + "</div>";
  }

  function confidenceNoteHTML(main, alt, target, hazard, pin) {
    if (!main || main.club === "—") return "";
    const note = confidenceNoteParts(main, alt, target, hazard, pin);
    const text = note.lines.join("｜");
    return '<div class="confidence-note" data-note="' + esc(text) + '"><div class="confidence-note-head"><b>一口令卡</b><button class="confidence-note-copy" type="button">複製口令</button></div>' +
      '<div class="confidence-note-line"><strong>' + esc(note.club) + '</strong><span>' + esc(note.call) + '</span></div>' +
      '<div class="confidence-note-grid">' + note.items.map((it) => '<div><b>' + esc(it.t) + '</b><span>' + esc(it.b) + '</span></div>').join("") + "</div></div>";
  }

  function confidenceNoteParts(main, alt, target, hazard, pin) {
    const light = confidenceTrafficLight(main);
    const landing = confidenceLandingPlan(main, target, hazard, pin);
    const aim = (main.aim && main.aim.call) || "瞄中間";
    const budget = confidenceBudgetParts(main, target).find((p) => p.label === "總容錯") || { value: "—" };
    const miss = landing.items.find((it) => it.cls === "accept") || { body: "接受安全 miss" };
    const avoid = landing.items.find((it) => it.cls === "avoid") || { body: "避開短邊" };
    const altText = alt && alt.club ? alt.club : "無";
    const club = target + "y｜拿 " + main.club + "｜" + light.label;
    const call = aim + "；容錯 " + budget.value + "；備用 " + altText;
    return {
      club,
      call,
      items: [
        { t: "目標", b: landing.summary },
        { t: "避開", b: avoid.body },
        { t: "可接受", b: miss.body },
      ],
      lines: [club, call, "避開：" + avoid.body, "可接受：" + miss.body],
    };
  }

  function confidenceRecentHTML(min, max) {
    const recent = (RECENT_DISTANCES || []).filter((d) => d >= min && d <= max).slice(0, 6);
    if (!recent.length) return "";
    return '<div class="confidence-recent"><div class="confidence-recent-head"><b>最近碼數</b><button class="confidence-recent-clear" type="button">清除</button></div>' +
      '<div class="confidence-recent-list">' + recent.map((d) => '<button type="button" data-distance="' + d + '" class="' + (d === TARGET_DISTANCE ? "on" : "") + '">' + d + "y</button>").join("") + "</div></div>";
  }

  function confidencePinnedHTML(min, max, mode, lie, hazard) {
    const pinned = (PINNED_DISTANCES || []).filter((d) => d >= min && d <= max).slice(0, 8);
    const on = pinned.indexOf(TARGET_DISTANCE) >= 0;
    const context = confidencePinnedContext(mode, lie, hazard);
    return '<div class="confidence-pinned"><div class="confidence-pinned-head"><b>固定碼數</b><button class="confidence-pin-distance ' + (on ? "on" : "") + '" type="button">' + (on ? "取消釘選" : "釘選目前") + '</button></div>' +
      '<div class="confidence-pinned-sub">' + esc(context) + '</div>' +
      (pinned.length ? '<div class="confidence-pinned-list">' + pinned.map((d) => {
        const row = MODEL ? confidenceRows(MODEL, d, mode, lie, hazard)[0] : null;
        const club = row ? row.club : "—";
        const pick = row ? confidencePick(row, d, true, mode) : null;
        const light = pick ? confidenceTrafficLight(pick) : { cls: "lay", label: "LAY" };
        const score = pick && pick.confidence ? pick.confidence.score || 0 : 0;
        return '<button type="button" data-distance="' + d + '" class="' + (d === TARGET_DISTANCE ? "on" : "") + '"><i class="' + esc(light.cls) + '">' + esc(light.label) + '</i><b>' + d + 'y</b><strong>' + esc(club) + '</strong><em>' + score + '/100</em><u><s style="width:' + clamp(score, 0, 100) + '%"></s></u><span>' + esc(confidenceDistanceTag(d)) + '</span></button>';
      }).join("") + "</div>" : '<div class="confidence-pinned-empty">把常打距離釘起來，下場可快速切換。</div>') +
      "</div>";
  }

  function confidencePinnedContext(mode, lie, hazard) {
    const m = confidenceModes().find((x) => x.id === normalizeConfidenceMode(mode));
    const l = confidenceLieOptions().find((x) => x.id === normalizeLie(lie));
    const h = confidenceHazardOptions().find((x) => x.id === normalizeHazardSide(hazard));
    return "依目前情境重算：" + [m ? m.label : "標準", l ? l.label : "球道", h && h.id !== "none" ? h.label : ""].filter(Boolean).join(" · ");
  }

  function confidenceDistanceTag(d) {
    d = Math.round(Number(d) || 0);
    if (d < 90) return "切上";
    if (d < 125) return "短桿";
    if (d < 155) return "標準";
    if (d < 185) return "長鐵";
    return "長攻";
  }

  function confidenceTradeoffHTML(main, alt, target) {
    if (!main || !alt) return "";
    const mainScore = main.confidence ? main.confidence.score || 0 : 0;
    const altScore = alt.confidence ? alt.confidence.score || 0 : 0;
    const m = confidenceTradeoffStats(main, target);
    const a = confidenceTradeoffStats(alt, target);
    const scoreDiff = mainScore - altScore;
    const lead = scoreDiff >= 8 ? "首選信心明顯較高" : scoreDiff <= -8 ? "備用其實更保守" : "兩支都可用，看旗位與危險";
    const body = confidenceTradeoffBody(m, a, scoreDiff);
    return '<div class="confidence-trade"><div class="confidence-trade-head"><b>拿桿取捨</b><span>' + esc(lead) + '</span></div>' +
      '<div class="confidence-trade-grid">' +
        confidenceTradeoffCardHTML("首選", main.club, mainScore, m, true) +
        confidenceTradeoffCardHTML("備用", alt.club, altScore, a, false) +
      '</div><div class="confidence-trade-call">' + esc(body) + "</div></div>";
  }

  function confidenceTradeoffStats(pick, target) {
    const metrics = (pick && pick.metrics) || [];
    const gap = metrics.find((m) => m.l === "距離差") || { v: "—" };
    const miss = metrics.find((m) => m.l === "失誤率") || { v: "—" };
    const budget = confidenceBudgetParts(pick, target).find((p) => p.label === "總容錯") || { value: "—" };
    const sample = metrics.find((m) => m.l === "採用球") || { v: "—" };
    return { gap: gap.v, miss: miss.v, room: budget.value, sample: sample.v };
  }

  function confidenceTradeoffCardHTML(label, club, score, stats, primary) {
    return '<div class="confidence-trade-card ' + (primary ? "primary" : "") + '"><span>' + esc(label) + '</span><strong>' + esc(club || "—") + '</strong>' +
      '<div><b>' + score + '</b><small>信心</small></div><div><b>' + esc(stats.gap) + '</b><small>距離差</small></div><div><b>' + esc(stats.miss) + '</b><small>失誤</small></div><div><b>' + esc(stats.room) + '</b><small>容錯</small></div></div>';
  }

  function confidenceTradeoffBody(main, alt, scoreDiff) {
    if (scoreDiff >= 8) return "照首選執行；備用只在短邊危險、風向不確定或想保守上果嶺時使用。";
    if (scoreDiff <= -8) return "備用信心不差，若旗位很窄或前後有危險，優先考慮備用安全打法。";
    if (String(main.gap).charAt(0) === "+" && String(alt.gap).charAt(0) !== "+") return "首選偏長、備用偏短；前旗或長邊危險時改備用，中後旗照首選。";
    if (String(main.gap).charAt(0) !== "+" && String(alt.gap).charAt(0) === "+") return "首選偏短、備用偏長；短邊危險時升到備用，否則照首選留上坡切推。";
    return "差距不大時以危險區決定：避短選長一點，避長選短一點，目標都放果嶺中間。";
  }

  function confidenceDashboardHTML(pick, target) {
    if (!pick || !pick.confidence) return "";
    const score = pick.confidence.score || 0;
    const light = confidenceTrafficLight(pick);
    const metrics = confidenceDashboardMetrics(pick, target);
    return '<div class="confidence-dash"><div class="confidence-dial ' + esc(light.cls) + '" style="--score:' + clamp(score, 0, 100) + '"><b>' + score + '</b><span>信心</span></div>' +
      '<div class="confidence-dash-body"><div class="confidence-dash-top"><b>' + esc(light.title) + '</b><i class="' + esc(light.cls) + '">' + esc(light.label) + '</i></div>' +
      '<div class="confidence-dash-metrics">' + metrics.map((m) => '<span><b>' + esc(m.v) + '</b><small>' + esc(m.l) + '</small></span>').join("") + "</div></div></div>";
  }

  function confidenceDashboardMetrics(pick, target) {
    const metrics = (pick && pick.metrics) || [];
    const gap = metrics.find((m) => m.l === "距離差") || { v: "—", l: "距離差" };
    const miss = metrics.find((m) => m.l === "失誤率") || { v: "—", l: "失誤率" };
    const budget = confidenceBudgetParts(pick, target).find((p) => p.label === "總容錯") || { value: "—" };
    const sample = metrics.find((m) => m.l === "採用球") || { v: "—", l: "採用球" };
    return [
      { v: gap.v, l: "距離差" },
      { v: miss.v, l: "失誤率" },
      { v: budget.value, l: "總容錯" },
      { v: sample.v, l: "樣本" },
    ];
  }

  function confidenceNextShotHTML(main, alt, target, hazard, pin) {
    if (!main || main.club === "—") return "";
    const decision = confidenceNextShotDecision(main, alt, target, hazard, pin);
    return '<div class="confidence-next ' + esc(decision.cls) + '"><div class="confidence-next-tag">' + esc(decision.tag) + '</div><div class="confidence-next-body"><b>' + esc(decision.title) + '</b><span>' + esc(decision.body) + '</span></div></div>';
  }

  function confidenceNextShotDecision(main, alt, target, hazard, pin) {
    const light = confidenceTrafficLight(main);
    const landing = confidenceLandingPlan(main, target, hazard, pin);
    const altText = alt && alt.club ? "；備用 " + alt.club : "";
    if (light.cls === "go") {
      return {
        cls: "go",
        tag: "攻",
        title: "照首選進攻，但目標只放中間",
        body: "拿 " + main.club + altText + "。" + landing.summary + "，不要追貼旗。",
      };
    }
    if (light.cls === "caution") {
      return {
        cls: "hold",
        tag: "守",
        title: "保守進攻，先避開大數字",
        body: "拿 " + main.club + altText + "。只接受安全 miss；旗位窄或風不穩就改備用。",
      };
    }
    return {
      cls: "lay",
      tag: "推",
      title: "不硬攻，先推進到好切位置",
      body: alt && alt.club ? "改用 " + alt.club + " 或短一支桿，目標是留下下一桿好角度。" : "選短一支穩定桿，目標是避開危險並留下好切球。",
    };
  }

  function confidenceDistanceBandHTML(main, alt, target) {
    if (!main || !main.window) return "";
    const band = confidenceDistanceBandParts(main, alt, target);
    return '<div class="confidence-band-card ' + esc(band.cls) + '">' +
      '<div class="confidence-band-card-head"><span>' + esc(band.kicker) + '</span><b>' + esc(band.title) + '</b><i>' + esc(band.light) + '</i></div>' +
      '<div class="confidence-band-card-body"><strong>' + esc(band.clubLine) + '</strong><p>' + esc(band.rule) + '</p></div>' +
      '<div class="confidence-band-card-grid">' + band.items.map((it) => '<div><b>' + esc(it.v) + '</b><span>' + esc(it.l) + '</span></div>').join("") + '</div>' +
      '</div>';
  }

  function confidenceDistanceBandParts(main, alt, target) {
    const light = confidenceTrafficLight(main);
    const budget = confidenceBudgetParts(main, target);
    const total = budget.find((p) => p.label === "總容錯") || { value: "—", cls: "bad" };
    const short = budget.find((p) => p.label === "短邊空間" || p.label === "平均偏長") || { value: "—" };
    const long = budget.find((p) => p.label === "長邊空間" || p.label === "距離不足") || { value: "—" };
    const w = main.window || { low: target, high: target };
    const score = main.confidence ? main.confidence.score || 0 : 0;
    const inWindow = target >= w.low && target <= w.high;
    let cls = "hold";
    let title = "邊界距離，保守打中間";
    let rule = "目標放果嶺中間，不追旗；只接受安全側 miss。";
    if (light.cls === "go" && inWindow && total.cls === "good") {
      cls = "go";
      title = "舒適距離，可以照計畫進攻";
      rule = "正常節奏，瞄安全中線；只有旗位很寬才把目標推近旗。";
    } else if (light.cls === "stop" || !inWindow || total.cls === "bad") {
      cls = "lay";
      title = "降級距離，先避開大數字";
      rule = alt && alt.club ? "優先考慮備用 " + alt.club + "，目標是留下好切球。" : "短一支穩定桿，先推進到好角度。";
    }
    return {
      cls,
      kicker: target + "y 距離帶",
      title,
      light: light.label,
      clubLine: "首選 " + main.club + (alt && alt.club ? "｜備用 " + alt.club : ""),
      rule,
      items: [
        { v: w.low + "-" + w.high + "y", l: "信心窗" },
        { v: total.value, l: "總容錯" },
        { v: score + "/100", l: "信心分" },
        { v: short.value + " / " + long.value, l: "短 / 長" },
      ],
    };
  }

  function confidenceBriefHTML(pick, playDistance) {
    const brief = confidenceBriefParts(pick, playDistance);
    return '<div class="confidence-brief">' +
      '<div class="confidence-brief-step"><b>1 Club</b><span>' + esc(brief.club) + '</span></div>' +
      '<div class="confidence-brief-step"><b>2 Aim</b><span>' + esc(brief.aim) + '</span></div>' +
      '<div class="confidence-brief-step"><b>3 Miss</b><span>' + esc(brief.miss + " · " + brief.swing) + '</span></div>' +
      "</div>";
  }

  function confidenceBriefParts(pick, playDistance) {
    const checks = (pick && pick.checks) || [];
    const club = pick && pick.club ? pick.club : "—";
    return {
      club: club + " 打 " + playDistance + "y",
      aim: (pick && pick.aim && pick.aim.call) || "瞄中間",
      miss: (checks[1] && checks[1].b) || "接受安全 miss",
      swing: (checks[2] && checks[2].b) || "完整收桿",
    };
  }

  function confidenceWindowHTML(pick, target) {
    if (!pick || !pick.window) return "";
    const w = pick.window;
    const lo = Math.max(1, Math.min(w.low, target) - 12);
    const hi = Math.max(w.high, target) + 12;
    const span = Math.max(1, hi - lo);
    const bandLeft = clamp(Math.round((w.low - lo) / span * 100), 0, 100);
    const bandRight = clamp(Math.round((w.high - lo) / span * 100), 0, 100);
    const targetLeft = clamp(Math.round((target - lo) / span * 100), 0, 100);
    return '<div class="confidence-window"><div class="confidence-window-top"><b>信心距離窗</b><span>' + esc(w.low + "-" + w.high + "y｜目標 " + target + "y") + '</span></div>' +
      '<div class="confidence-ruler"><div class="confidence-ruler-band" style="left:' + bandLeft + '%;width:' + Math.max(4, bandRight - bandLeft) + '%"></div><div class="confidence-ruler-target" style="left:' + targetLeft + '%"></div></div>' +
      '<div class="confidence-ruler-labels"><span>' + lo + 'y</span><span>' + hi + 'y</span></div></div>';
  }

  function confidenceBudgetHTML(pick, target) {
    const parts = confidenceBudgetParts(pick, target);
    if (!parts.length) return "";
    return '<div class="confidence-budget"><div class="confidence-budget-title"><b>容錯碼數</b><span>用信心距離窗判斷這支桿可不可以犯錯</span></div>' +
      '<div class="confidence-budget-grid">' + parts.map((p) =>
        '<div class="confidence-budget-item ' + esc(p.cls) + '"><b>' + esc(p.value) + '</b><span>' + esc(p.label) + '</span><i>' + esc(p.note) + '</i></div>'
      ).join("") + "</div></div>";
  }

  function confidenceBudgetParts(pick, target) {
    if (!pick || !pick.window) return [];
    const low = Number(pick.window.low) || target;
    const high = Number(pick.window.high) || target;
    const shortRoom = Math.round(target - low);
    const longRoom = Math.round(high - target);
    const totalRoom = Math.max(0, Math.round(high - low));
    const shortHazard = HAZARD_SIDE === "short";
    const longHazard = HAZARD_SIDE === "long";
    const shortBad = shortRoom < 0 || (shortHazard && shortRoom < 6);
    const longBad = longRoom < 0 || (longHazard && longRoom < 6);
    const shortLabel = shortRoom < 0 ? "平均偏長" : "短邊空間";
    const longLabel = longRoom < 0 ? "距離不足" : "長邊空間";
    const shortValue = shortRoom < 0 ? "+" + Math.abs(shortRoom) + "y" : "+" + shortRoom + "y";
    const longValue = longRoom < 0 ? "-" + Math.abs(longRoom) + "y" : "+" + longRoom + "y";
    return [
      {
        cls: shortBad ? "bad" : shortRoom < 7 ? "warn" : "good",
        value: shortValue,
        label: shortLabel,
        note: shortRoom < 0 ? "這支桿正常落點會過目標" : shortHazard ? "短邊有危險，至少留 6y 以上" : "短了還有多少可接受",
      },
      {
        cls: longBad ? "bad" : longRoom < 7 ? "warn" : "good",
        value: longValue,
        label: longLabel,
        note: longRoom < 0 ? "需要硬打才會到，建議升一支" : longHazard ? "長邊有危險，不要打滿" : "打厚或跳多時的餘裕",
      },
      {
        cls: totalRoom >= 18 ? "good" : totalRoom >= 12 ? "warn" : "bad",
        value: totalRoom + "y",
        label: "總容錯",
        note: confidenceBudgetNote(totalRoom),
      },
    ];
  }

  function confidenceBudgetNote(totalRoom) {
    if (totalRoom >= 18) return "適合當首選，正常揮桿即可";
    if (totalRoom >= 12) return "可用，但目標放果嶺中間";
    return "容錯偏小，優先找備用桿";
  }

  function confidenceLightHTML(pick) {
    const light = confidenceTrafficLight(pick);
    return '<div class="confidence-light"><div class="confidence-light-badge ' + esc(light.cls) + '">' + esc(light.label) + '</div><div><b>' + esc(light.title) + '</b><span>' + esc(light.body) + '</span></div></div>';
  }

  function confidenceTrafficLight(pick) {
    const score = pick && pick.confidence ? pick.confidence.score || 0 : 0;
    const missMetric = ((pick && pick.metrics) || []).find((m) => m.l === "失誤率");
    const miss = missMetric ? Number(String(missMetric.v).replace("%", "")) || 0 : 0;
    const gapMetric = ((pick && pick.metrics) || []).find((m) => m.l === "距離差");
    const gapText = gapMetric ? gapMetric.v : "—";
    if (score >= 72 && miss <= 25) {
      return { cls: "go", label: "GO", title: "可以進攻，但目標放中間", body: "信心分與失誤率都在可接受範圍；不要硬攻短邊旗，照 Caddie Call 執行。" };
    }
    if (score >= 45 && miss <= 42) {
      return { cls: "caution", label: "HOLD", title: "保守進攻，接受安全 miss", body: "這球能打，但容錯不大；距離差 " + gapText + "，優先避免飛過或短邊。" };
    }
    return { cls: "stop", label: "LAY", title: "先不硬攻，改成推進球", body: "信心分或失誤率不支持強攻；選寬的一側，目標是留下好切球與避免大數字。" };
  }

  function confidenceAimHTML(pick) {
    const aim = (pick && pick.aim) || { label: "方向", call: "瞄中間", body: "方向樣本不足，先用標準目標線。" };
    return '<div class="confidence-aim"><b>' + esc(aim.label) + '</b><span><strong>' + esc(aim.call) + '</strong>｜' + esc(aim.body) + '</span></div>';
  }

  function confidenceLandingHTML(pick, target, hazard, pin) {
    if (!pick || !pick.window) return "";
    const plan = confidenceLandingPlan(pick, target, hazard, pin);
    return '<div class="confidence-landing"><div class="confidence-landing-title"><b>安全落點指令</b><span>' + esc(plan.summary) + '</span></div>' +
      '<div class="confidence-landing-grid">' + plan.items.map((it) =>
        '<div class="confidence-landing-item ' + esc(it.cls) + '"><b>' + esc(it.title) + '</b><span>' + esc(it.body) + '</span></div>'
      ).join("") + "</div></div>";
  }

  function confidenceLandingPlan(pick, target, hazard, pin) {
    hazard = hazard || confidenceHazardOptions()[0];
    pin = pin || confidencePinPositions()[1];
    const w = pick.window || { low: target, high: target };
    const aim = (pick.aim && pick.aim.call) || "瞄中間";
    const light = confidenceTrafficLight(pick);
    const landingLow = Math.max(1, Math.min(target, w.low));
    const landingHigh = Math.max(target, w.high);
    const avoid = confidenceAvoidText(hazard, pin);
    const accept = confidenceAcceptMissText(pick, target, hazard);
    const summary = light.label + "｜" + aim + "｜目標 " + landingLow + "-" + landingHigh + "y";
    return {
      summary,
      items: [
        { cls: "target", title: "落點目標", body: aim + "，讓球落在 " + landingLow + "-" + landingHigh + "y 區間。" },
        { cls: "avoid", title: "絕對避開", body: avoid },
        { cls: "accept", title: "可接受 miss", body: accept },
      ],
    };
  }

  function confidenceAvoidText(hazard, pin) {
    const h = hazard && hazard.id ? hazard.id : "none";
    if (h === "left") return "左側 OB / 水池 / 麻煩區，不要用會加深左偏的補償。";
    if (h === "right") return "右側 OB / 水池 / 麻煩區，寧可左半邊安全落地。";
    if (h === "short") return "短邊與前方障礙，這球不要短在旗前。";
    if (h === "long") return "果嶺後方與長邊，這球不要打滿飛過。";
    if (pin && pin.id === "front") return "前旗短邊，不要貪近旗留下困難切球。";
    if (pin && pin.id === "back") return "後旗長邊，不要飛過果嶺。";
    return "短邊旗與窄邊，目標放中間，不追貼旗。";
  }

  function confidenceAcceptMissText(pick, target, hazard) {
    const w = pick.window || { low: target, high: target };
    const gapText = ((pick.metrics || []).find((m) => m.l === "距離差") || {}).v || "—";
    const h = hazard && hazard.id ? hazard.id : "none";
    if (h === "short") return "接受長到中間，不能短；距離差 " + gapText + "。";
    if (h === "long") return "接受短在果嶺前緣，不能飛過；距離差 " + gapText + "。";
    if (h === "left") return "接受右半邊或中間，不能左漏；信心窗 " + w.low + "-" + w.high + "y。";
    if (h === "right") return "接受左半邊或中間，不能右漏；信心窗 " + w.low + "-" + w.high + "y。";
    if (target < w.low) return "這支偏長，接受落在中後段，不要再加速。";
    if (target > w.high) return "這支偏短，接受短一點，下一桿保留好角度。";
    return "接受中間偏安全側，避免短邊和大數字。";
  }

  function confidenceContextText(pin, lie, hazard) {
    const mode = confidenceModes().find((m) => m.id === CONFIDENCE_MODE) || confidenceModes()[1];
    hazard = hazard || confidenceHazardOptions()[0];
    const parts = [mode.label, pin.label, lie.label];
    if (hazard.id !== "none") parts.push(hazard.label);
    if (PLAYING_ADJUST) parts.push((PLAYING_ADJUST > 0 ? "+" : "") + PLAYING_ADJUST + "y");
    return "目前條件：" + parts.join(" · ");
  }

  function confidenceScoreHTML(pick) {
    const score = pick && pick.confidence ? pick.confidence.score || 0 : 0;
    return '<div class="confidence-score"><div class="confidence-score-top"><span>信心分</span><span>' + score + '/100</span></div><div class="confidence-score-track"><div class="confidence-score-fill" style="width:' + clamp(score, 0, 100) + '%"></div></div></div>';
  }

  function confidenceMicroHTML(pick) {
    const metrics = (pick && pick.metrics) || [];
    if (!metrics.length) return "";
    return '<div class="confidence-micro">' + metrics.map((m) => '<div class="confidence-metric"><b>' + esc(m.v) + '</b><span>' + esc(m.l) + '</span></div>').join("") + "</div>";
  }

  function confidenceCommand(pick, mode, adjust, pin, lie, hazard) {
    if (!pick || pick.club === "—") return "資料不足｜先保守推進｜留下好切球";
    const checks = pick.checks || [];
    const aim = (pick.aim && pick.aim.call) || (checks[0] && checks[0].b) || "安全側";
    const swing = (checks[2] && checks[2].b) || "完整收桿";
    const modeLabel = confidenceModes().find((m) => m.id === normalizeConfidenceMode(mode));
    pin = pin || confidencePinPositions()[1];
    lie = lie || confidenceLieOptions()[0];
    hazard = hazard || confidenceHazardOptions()[0];
    const adj = adjust ? "｜實戰 " + (adjust > 0 ? "+" : "") + adjust + "y" : "";
    const pinText = pin.id === "middle" ? "" : "｜" + pin.label.replace(" -5", "").replace(" +5", "");
    const lieText = lie.id === "fairway" ? "" : "｜" + lie.label;
    const hazardText = hazard.id === "none" ? "" : "｜避" + hazard.shortLabel;
    return "拿 " + pick.club + "｜" + (modeLabel ? modeLabel.label : "標準") + pinText + lieText + hazardText + adj + "｜" + aim + "｜" + swing;
  }

  function confidenceMetrics(r, target) {
    const gap = Math.round(r.o.carry - target);
    return [
      { v: confidenceGapText(gap), l: "距離差" },
      { v: (r.o.mishit_rate || 0) + "%", l: "失誤率" },
      { v: (r.o.n_used || 0) + "/" + (r.o.n_total || 0), l: "採用球" },
    ];
  }

  function confidenceGapText(gap) {
    gap = Math.round(gap || 0);
    if (gap === 0) return "剛好";
    return (gap > 0 ? "+" : "") + gap + "y";
  }

  function confidencePlan(r, target, c, mode) {
    const gap = Math.round(r.o.carry - target);
    if (mode === "safe") {
      return { title: "策略：保守避大數字", body: "優先選失誤率低、短邊風險小的打法；寧可短一點，也不要硬攻旗桿。" };
    }
    if (mode === "attack") {
      return { title: "策略：進攻目標區", body: "距離權重大於保守懲罰；只在前方風險可接受時使用，目標仍放果嶺中間。" };
    }
    if (c.cls === "high" && Math.abs(gap) <= 4) {
      return { title: "打法：正常節奏打中間", body: "這支桿接近目標距離，瞄果嶺中間，不需要加速硬打。" };
    }
    if (gap > 8) {
      return { title: "打法：控制揮桿", body: "平均距離偏長，目標放果嶺前半或安全側，避免打滿飛過頭。" };
    }
    if (gap < -8) {
      return { title: "打法：保守上球道", body: "平均距離偏短，除非前方無大風險，否則接受短一點、留下好切球位置。" };
    }
    if ((r.o.mishit_rate || 0) >= 35) {
      return { title: "打法：降風險", body: "失誤率偏高，選寬的一側，不攻短邊旗位；這球的任務是避免大數字。" };
    }
    return { title: "打法：標準進攻", body: "距離落在可用區間，先做完整收桿與固定目標線。" };
  }

  function confidenceModes() {
    return [
      { id: "safe", label: "保守" },
      { id: "standard", label: "標準" },
      { id: "attack", label: "進攻" },
    ];
  }

  function confidenceViewOptions() {
    return [
      { id: "compact", label: "精簡" },
      { id: "full", label: "詳細" },
    ];
  }

  function confidencePresets() {
    return [
      { id: "reset", label: "標準球位", note: "標準模式、中間旗、球道、無危險邊。" },
      { id: "safe", label: "避大數字", note: "保守模式，優先避長邊或目前指定危險邊。" },
      { id: "wind", label: "逆風保守", note: "逆風 +10y、保守模式、短邊視為危險。" },
      { id: "attackBack", label: "攻後旗", note: "進攻模式、後旗，長邊視為危險。" },
    ];
  }

  function activeConfidencePreset() {
    if (CONFIDENCE_MODE === "safe" && PLAYING_ADJUST === 10 && PIN_POSITION === "middle" && BALL_LIE === "fairway" && HAZARD_SIDE === "short") return "wind";
    if (CONFIDENCE_MODE === "attack" && PLAYING_ADJUST === 0 && PIN_POSITION === "back" && BALL_LIE === "fairway" && HAZARD_SIDE === "long") return "attackBack";
    if (CONFIDENCE_MODE === "safe" && PLAYING_ADJUST === 0 && PIN_POSITION === "middle" && BALL_LIE === "fairway") return "safe";
    if (CONFIDENCE_MODE === "standard" && PLAYING_ADJUST === 0 && PIN_POSITION === "middle" && BALL_LIE === "fairway" && HAZARD_SIDE === "none") return "reset";
    return "";
  }

  function confidencePresetNote() {
    const id = activeConfidencePreset();
    const p = confidencePresets().find((x) => x.id === id);
    if (p) return "策略包：" + p.label + "｜" + p.note;
    return "策略包：自訂｜目前條件已手動調整，推薦會依所有選項即時計算。";
  }

  function applyConfidencePreset(id) {
    if (id === "safe") {
      CONFIDENCE_MODE = "safe";
      PLAYING_ADJUST = 0;
      PIN_POSITION = "middle";
      BALL_LIE = "fairway";
      HAZARD_SIDE = HAZARD_SIDE === "none" ? "long" : HAZARD_SIDE;
    } else if (id === "wind") {
      CONFIDENCE_MODE = "safe";
      PLAYING_ADJUST = 10;
      PIN_POSITION = "middle";
      BALL_LIE = "fairway";
      HAZARD_SIDE = "short";
    } else if (id === "attackBack") {
      CONFIDENCE_MODE = "attack";
      PLAYING_ADJUST = 0;
      PIN_POSITION = "back";
      BALL_LIE = "fairway";
      HAZARD_SIDE = "long";
    } else {
      CONFIDENCE_MODE = "standard";
      PLAYING_ADJUST = 0;
      PIN_POSITION = "middle";
      BALL_LIE = "fairway";
      HAZARD_SIDE = "none";
    }
    saveConfidenceMode(CONFIDENCE_MODE);
    savePlayingAdjust(PLAYING_ADJUST);
    savePinPosition(PIN_POSITION);
    saveBallLie(BALL_LIE);
    saveHazardSide(HAZARD_SIDE);
  }

  function confidenceScenarios() {
    return [
      { id: "center", label: "中間安全", short: "標準", note: "中間旗、球道、無明顯危險，照標準推薦。", mode: "standard", adjust: 0, pin: "middle", lie: "fairway", hazard: "none" },
      { id: "front", label: "前旗", short: "別短邊", note: "前旗時短邊 miss 最麻煩，推薦會略保守避短。", mode: "safe", adjust: -5, pin: "front", lie: "fairway", hazard: "short" },
      { id: "back", label: "後旗", short: "別飛過", note: "後旗時長邊危險，推薦會避免打滿飛過頭。", mode: "standard", adjust: 5, pin: "back", lie: "fairway", hazard: "long" },
      { id: "rough", label: "長草", short: "降風險", note: "長草球位不追極限距離，優先選穩定與容錯。", mode: "safe", adjust: 0, pin: "middle", lie: "rough", hazard: "none" },
      { id: "right", label: "右危", short: "避右", note: "右側 OB、水池或大麻煩時，推薦會懲罰右偏傾向。", mode: "safe", adjust: 0, pin: "middle", lie: "fairway", hazard: "right" },
      { id: "left", label: "左危", short: "避左", note: "左側 OB、水池或大麻煩時，推薦會懲罰左偏傾向。", mode: "safe", adjust: 0, pin: "middle", lie: "fairway", hazard: "left" },
    ];
  }

  function activeConfidenceScenario() {
    const match = confidenceScenarios().find((s) =>
      s.mode === CONFIDENCE_MODE &&
      s.adjust === PLAYING_ADJUST &&
      s.pin === PIN_POSITION &&
      s.lie === BALL_LIE &&
      s.hazard === HAZARD_SIDE
    );
    return match ? match.id : "";
  }

  function confidenceScenarioNote() {
    const s = confidenceScenarios().find((x) => x.id === activeConfidenceScenario());
    if (s) return "球場情境：" + s.label + "｜" + s.note;
    return "球場情境：自訂｜可以用下面的風、旗位、球位與危險邊微調。";
  }

  function applyConfidenceScenario(id) {
    const s = confidenceScenarios().find((x) => x.id === id) || confidenceScenarios()[0];
    CONFIDENCE_MODE = s.mode;
    PLAYING_ADJUST = s.adjust;
    PIN_POSITION = s.pin;
    BALL_LIE = s.lie;
    HAZARD_SIDE = s.hazard;
    saveConfidenceMode(CONFIDENCE_MODE);
    savePlayingAdjust(PLAYING_ADJUST);
    savePinPosition(PIN_POSITION);
    saveBallLie(BALL_LIE);
    saveHazardSide(HAZARD_SIDE);
  }

  function confidenceAdjustments() {
    return [
      { v: -10, label: "順風 -10" },
      { v: -5, label: "微短 -5" },
      { v: 0, label: "正常" },
      { v: 5, label: "微長 +5" },
      { v: 10, label: "逆風 +10" },
    ];
  }

  function confidencePinPositions() {
    return [
      { id: "front", label: "前旗 -5", shortLabel: "前旗", adjust: -5 },
      { id: "middle", label: "中間", shortLabel: "中旗", adjust: 0 },
      { id: "back", label: "後旗 +5", shortLabel: "後旗", adjust: 5 },
    ];
  }

  function normalizePinPosition(v) {
    return v === "front" || v === "back" ? v : "middle";
  }

  function confidenceLieOptions() {
    return [
      { id: "fairway", label: "球道", shortLabel: "球道" },
      { id: "rough", label: "長草", shortLabel: "長草" },
      { id: "tee", label: "架 Tee", shortLabel: "Tee" },
    ];
  }

  function normalizeLie(v) {
    return v === "rough" || v === "tee" ? v : "fairway";
  }

  function confidenceHazardOptions() {
    return [
      { id: "none", label: "無危險", shortLabel: "無" },
      { id: "left", label: "左危", shortLabel: "左邊" },
      { id: "right", label: "右危", shortLabel: "右邊" },
      { id: "short", label: "短危", shortLabel: "短邊" },
      { id: "long", label: "長危", shortLabel: "長邊" },
    ];
  }

  function normalizeHazardSide(v) {
    return v === "left" || v === "right" || v === "short" || v === "long" ? v : "none";
  }

  function normalizeConfidenceMode(v) {
    return v === "safe" || v === "attack" ? v : "standard";
  }

  function normalizeConfidenceView(v) {
    return v === "full" ? "full" : "compact";
  }

  function normalizeCourseMode(v) {
    return v === true || v === "true" || v === "on";
  }

  function confidenceModePenalty(mode, gap, risk, isWood, target) {
    if (mode === "safe") {
      const longPenalty = gap > 0 ? Math.min(24, gap * 0.75) : 0;
      const tooShortPenalty = gap < -18 ? Math.min(16, Math.abs(gap + 18) * 0.4) : 0;
      const woodRisk = isWood && target < 185 ? 8 : 0;
      return longPenalty + tooShortPenalty + risk * 0.25 + woodRisk;
    }
    if (mode === "attack") {
      const shortPenalty = gap < 0 ? Math.min(18, Math.abs(gap) * 0.5) : 0;
      const longPenalty = gap > 14 ? Math.min(10, (gap - 14) * 0.35) : 0;
      return shortPenalty + longPenalty - Math.min(10, risk * 0.12);
    }
    return 0;
  }

  function confidenceLiePenalty(lie, club, isWood, target) {
    lie = normalizeLie(lie);
    if (lie === "rough") {
      if (isWood && club !== "3H") return target < 190 ? 34 : 22;
      if (isWood) return 12;
      return 4;
    }
    if (lie === "tee") {
      if (isWood) return -8;
      return 0;
    }
    return 0;
  }

  function confidenceHazardPenalty(hazard, gap, o) {
    hazard = normalizeHazardSide(hazard);
    if (hazard === "none") return 0;
    if (hazard === "short") return gap < 0 ? Math.min(28, Math.abs(gap) * 0.9 + 8) : 0;
    if (hazard === "long") return gap > 0 ? Math.min(28, gap * 0.9 + 8) : 0;
    const left = o.n_left || 0;
    const right = o.n_right || 0;
    const mean = o.off_mean || 0;
    if (hazard === "left") {
      const leftBias = left > right ? Math.min(18, (left - right) * 3) : 0;
      return Math.max(0, leftBias + (mean < -1 ? Math.min(12, Math.abs(mean) * 2) : 0));
    }
    if (hazard === "right") {
      const rightBias = right > left ? Math.min(18, (right - left) * 3) : 0;
      return Math.max(0, rightBias + (mean > 1 ? Math.min(12, mean * 2) : 0));
    }
    return 0;
  }

  function confidenceQuickDistances(rows, min, max) {
    const candidates = [80, 100, 120, 140, 150, 160, 170, 190, 210]
      .concat(rows.map((r) => Math.round(r.o.carry / 10) * 10))
      .filter((v) => v >= min && v <= max);
    const out = [];
    candidates.forEach((v) => {
      if (out.indexOf(v) < 0) out.push(v);
    });
    return out.sort((a, b) => a - b).slice(0, 10);
  }

  function confidenceLevel(r) {
    const sample = (r.o.n_used || 0) >= 12 ? 8 : (r.o.n_used || 0) >= 6 ? 2 : -10;
    const miss = Math.max(0, r.o.mishit_rate || 0);
    const score = clamp(Math.round(92 - r.diff * 3 - miss * 0.9 + sample), 5, 98);
    if (score >= 72 && r.diff <= 6 && miss <= 25) return { cls: "high", label: "高信心", score };
    if (score >= 45 && r.diff <= 14 && miss <= 42) return { cls: "mid", label: "可用但保守", score };
    return { cls: "low", label: "低信心，降一級策略", score };
  }

  function confidenceChecks(r, target, mode) {
    const gap = Math.round(r.o.carry - target);
    const aim = mode === "attack" ? "果嶺中間" : mode === "safe" ? "安全側" : "中間偏安全";
    const miss = gap > 8 ? "接受短一點" : gap < -8 ? "不硬加速" : "不要短邊";
    const swing = (r.o.mishit_rate || 0) >= 35 ? "七成節奏" : "完整收桿";
    return [
      { t: "瞄準", b: aim },
      { t: "容錯", b: miss },
      { t: "揮桿", b: swing },
    ];
  }

  function confidenceAimAdvice(r, mode) {
    const o = r && r.o ? r.o : {};
    const left = o.n_left || 0;
    const right = o.n_right || 0;
    const center = o.n_center || 0;
    const total = left + right + center;
    const mean = o.off_mean || 0;
    if (total < 6) {
      return { label: "方向樣本", call: mode === "attack" ? "瞄果嶺中間" : "瞄安全側", body: "方向樣本不足，先不要用補償打法，選寬的一側。" };
    }
    if (right >= left * 1.6 && right - left >= 3 && mean >= 1) {
      return { label: "常偏右", call: "瞄左半邊", body: "穩定球方向 " + left + "L:" + right + "R，平均 " + fmtOff(mean) + "；用左半邊留右 miss 空間。" };
    }
    if (left >= right * 1.6 && left - right >= 3 && mean <= -1) {
      return { label: "常偏左", call: "瞄右半邊", body: "穩定球方向 " + left + "L:" + right + "R，平均 " + fmtOff(mean) + "；用右半邊留左 miss 空間。" };
    }
    return { label: "方向均衡", call: mode === "attack" ? "瞄果嶺中間" : "瞄中間偏安全", body: "穩定球方向 " + left + "L:" + right + "R，平均 " + fmtOff(mean) + "；主要管理距離與短邊。" };
  }

  function fallbackConfidenceChecks() {
    return [
      { t: "瞄準", b: "安全側" },
      { t: "容錯", b: "留好切球" },
      { t: "揮桿", b: "不硬打" },
    ];
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
        trend: trend ? trend.label + (trend.delta != null ? " " + signedPct(trend.delta) : "") : "",
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
    h += eventConfidencePlannerHTML(e, holeTargets);
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

    h += '<div class="sec"><div class="sec-h"><span class="sec-n num">03</span><span class="sec-t">逐洞目標桿</span></div><div class="tablewrap"><table class="dtable event-hole-table"><thead><tr><th>洞</th><th>Par</th><th>碼數</th><th>信心卡</th><th>HCP</th><th>目標</th><th>重點</th></tr></thead><tbody>';
    holeTargets.forEach((r) => {
      const holeTag = eventHoleTag(e, r.hole);
      const parClass = r.par === 3 ? "par3" : r.par === 5 ? "par5" : "par4";
      const plan = eventHoleConfidencePlan(e, r);
      h += '<tr class="' + parClass + '"><td>' + r.hole + (holeTag ? " · " + esc(holeTag) : "") + '</td><td><span class="par-pill ' + parClass + '">Par ' + r.par + '</span></td><td class="yard-cell">' + eventYardText(e, r) + '</td><td>' + eventHoleConfidenceButton(plan) + "</td><td>" + esc(r.hcp || "—") + "</td><td>" + esc(r.target || "—") + "</td><td style=\"white-space:normal;text-align:left\">" + esc(r.note || "") + "</td></tr>";
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
    bindEventConfidenceButtons();
  }

  function eventConfidencePlannerHTML(e, holeTargets) {
    const plans = (holeTargets || []).map((r) => eventHoleConfidencePlan(e, r)).filter(Boolean);
    if (!plans.length) return "";
    const key = plans.filter((p) => p.priority).slice(0, 8);
    const rows = (key.length ? key : plans.slice(0, 8));
    return '<div class="sec"><div class="sec-h"><span class="sec-n num">02A</span><span class="sec-t">逐洞信心卡連動</span></div>' +
      '<div class="event-confidence-grid">' + rows.map((p) =>
        '<button class="event-confidence-card ' + esc(p.cls) + '" type="button" data-event-distance="' + p.distance + '">' +
          '<span>Hole ' + p.hole + ' · Par ' + p.par + '</span><strong>' + p.distance + 'y</strong><b>' + esc(p.club) + '</b><small>' + esc(p.label + "｜" + p.note) + '</small>' +
        '</button>'
      ).join("") + '</div><div class="note">點擊任一洞會切到信心球桿距離卡，打開下場模式並帶入該洞預估距離。</div></div>';
  }

  function eventHoleConfidenceButton(plan) {
    if (!plan) return "—";
    return '<button class="event-confidence-mini ' + esc(plan.cls) + '" type="button" data-event-distance="' + plan.distance + '"><b>' + plan.distance + 'y</b><span>' + esc(plan.club) + '</span></button>';
  }

  function bindEventConfidenceButtons() {
    document.querySelectorAll("[data-event-distance]").forEach((b) => {
      b.addEventListener("click", () => {
        const n = Math.round(Number(b.dataset.eventDistance) || TARGET_DISTANCE);
        TARGET_DISTANCE = clamp(n, 1, 320);
        COURSE_MODE = true;
        CONFIDENCE_VIEW = "compact";
        saveCourseMode(COURSE_MODE);
        saveConfidenceView(CONFIDENCE_VIEW);
        rememberRecentDistance(TARGET_DISTANCE, 1, 320);
        setTab("data");
        renderConfidenceCard();
        const card = document.querySelector("#confidence-card");
        if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function eventHoleConfidencePlan(e, row) {
    const yard = eventPrimaryYard(e, row);
    if (!yard) return null;
    const par = Number(row.par) || 4;
    const risk = eventHoleTag(e, row.hole);
    let distance = yard;
    let label = "開球進攻";
    if (par === 4) {
      const tee = eventTeeShotDistance(risk);
      distance = clamp(Math.round(yard - tee), 65, 220);
      label = "第二桿預估";
    } else if (par === 5) {
      distance = yard >= 520 ? 120 : 100;
      label = "第三桿 layup";
    } else {
      label = "Par3 進攻";
    }
    const pick = MODEL && MODEL.order && MODEL.order.length ? confidenceData(MODEL, distance, "safe", BALL_LIE, risk ? eventRiskToHazard(risk) : HAZARD_SIDE).main : null;
    const light = pick ? confidenceTrafficLight(pick) : { cls: "stop", label: "LAY" };
    return {
      hole: row.hole,
      par,
      distance,
      label,
      club: pick && pick.club ? pick.club : "—",
      cls: light.cls,
      note: risk ? "避" + risk : (row.note || "照策略打中間"),
      priority: !!risk || par === 3 || par === 5,
    };
  }

  function eventTeeShotDistance(risk) {
    const d = MODEL && MODEL.clubs ? MODEL.clubs.D : null;
    const w3 = MODEL && MODEL.clubs ? MODEL.clubs["3W"] : null;
    const base = risk && w3 ? w3.total : d ? d.total : w3 ? w3.total : 190;
    return Math.round((base || 190) * (risk ? 0.92 : 0.96));
  }

  function eventRiskToHazard(risk) {
    if (risk === "右OB") return "right";
    if (risk === "左OB") return "left";
    if (risk === "水") return "short";
    return "none";
  }

  function eventPrimaryYard(e, row) {
    const hole = typeof row === "number" ? row : row.hole;
    const target = typeof row === "object" ? row : (e.holeTargets || []).find((r) => r.hole === hole) || {};
    const y = target.yards || (String(e.id || "").indexOf("donghua") >= 0 ? DONGHUA_YARDS[hole] : null);
    if (!y) return 0;
    const preferred = y.recommendedTee || y.preferred || "red";
    return Math.round(Number(y[preferred] || y.red || y.white || y.blue || y.recommended || 0));
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
    const dock = document.querySelector("#field-dock");
    if (dock) {
      dock.classList.remove("show");
      dock.innerHTML = "";
    }
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
  function normalizeTheme(v) {
    return v === "light" || v === "dark" ? v : "auto";
  }
  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function actualTheme(v) {
    v = normalizeTheme(v);
    if (v === "auto") return systemPrefersDark() ? "dark" : "light";
    return v;
  }
  function themeStatusText(v, actual) {
    v = normalizeTheme(v);
    actual = actual || actualTheme(v);
    if (v === "auto") return actual === "dark" ? "自動：科技黑" : "自動：科技白";
    return actual === "dark" ? "科技黑" : "科技白";
  }
  function bindSystemThemeWatcher() {
    if (!window.matchMedia || bindSystemThemeWatcher.bound) return;
    bindSystemThemeWatcher.bound = true;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (UI_THEME === "auto") applyTheme(UI_THEME);
    };
    if (mq.addEventListener) mq.addEventListener("change", update);
    else if (mq.addListener) mq.addListener(update);
  }
  function readAvatarStyle() {
    try {
      const v = localStorage.getItem("golfRoomAvatarStyle");
      return v === "cyber" ? "cyber" : "cute";
    } catch (e) {
      return "cute";
    }
  }
  function readTheme() {
    try {
      const v = localStorage.getItem("golfRoomTheme");
      return normalizeTheme(v);
    } catch (e) {
      return "auto";
    }
  }
  function readConfidenceView() {
    try {
      return normalizeConfidenceView(localStorage.getItem("golfRoomConfidenceView"));
    } catch (e) {
      return "compact";
    }
  }
  function readCourseMode() {
    try {
      return normalizeCourseMode(localStorage.getItem("golfRoomCourseMode"));
    } catch (e) {
      return false;
    }
  }
  function readConfidenceMode() {
    try {
      return normalizeConfidenceMode(localStorage.getItem("golfRoomConfidenceMode"));
    } catch (e) {
      return "standard";
    }
  }
  function readPlayingAdjust() {
    try {
      return clamp(Math.round(Number(localStorage.getItem("golfRoomPlayingAdjust")) || 0), -20, 20);
    } catch (e) {
      return 0;
    }
  }
  function readPinPosition() {
    try {
      return normalizePinPosition(localStorage.getItem("golfRoomPinPosition"));
    } catch (e) {
      return "middle";
    }
  }
  function readBallLie() {
    try {
      return normalizeLie(localStorage.getItem("golfRoomBallLie"));
    } catch (e) {
      return "fairway";
    }
  }
  function readHazardSide() {
    try {
      return normalizeHazardSide(localStorage.getItem("golfRoomHazardSide"));
    } catch (e) {
      return "none";
    }
  }
  function readRecentDistances() {
    try {
      const raw = JSON.parse(localStorage.getItem("golfRoomRecentDistances") || "[]");
      return Array.isArray(raw) ? raw.map((v) => Math.round(Number(v))).filter((v) => Number.isFinite(v) && v > 0).slice(0, 6) : [];
    } catch (e) {
      return [];
    }
  }
  function readPinnedDistances() {
    try {
      const raw = JSON.parse(localStorage.getItem("golfRoomPinnedDistances") || "[100,120,150]");
      return Array.isArray(raw) ? raw.map((v) => Math.round(Number(v))).filter((v) => Number.isFinite(v) && v > 0).slice(0, 8) : [100, 120, 150];
    } catch (e) {
      return [100, 120, 150];
    }
  }
  function saveAvatarStyle(v) {
    try {
      localStorage.setItem("golfRoomAvatarStyle", v === "cyber" ? "cyber" : "cute");
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveTheme(v) {
    try {
      localStorage.setItem("golfRoomTheme", normalizeTheme(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveConfidenceView(v) {
    try {
      localStorage.setItem("golfRoomConfidenceView", normalizeConfidenceView(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveCourseMode(v) {
    try {
      localStorage.setItem("golfRoomCourseMode", normalizeCourseMode(v) ? "true" : "false");
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveConfidenceMode(v) {
    try {
      localStorage.setItem("golfRoomConfidenceMode", normalizeConfidenceMode(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function savePlayingAdjust(v) {
    try {
      localStorage.setItem("golfRoomPlayingAdjust", String(clamp(Math.round(Number(v) || 0), -20, 20)));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function savePinPosition(v) {
    try {
      localStorage.setItem("golfRoomPinPosition", normalizePinPosition(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveBallLie(v) {
    try {
      localStorage.setItem("golfRoomBallLie", normalizeLie(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function saveHazardSide(v) {
    try {
      localStorage.setItem("golfRoomHazardSide", normalizeHazardSide(v));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function rememberRecentDistance(v, min, max) {
    const n = clamp(Math.round(Number(v) || 0), min || 1, max || 320);
    if (!n) return;
    const out = [n].concat((RECENT_DISTANCES || []).filter((d) => d !== n)).slice(0, 6);
    RECENT_DISTANCES = out;
    try {
      localStorage.setItem("golfRoomRecentDistances", JSON.stringify(out));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function clearRecentDistances() {
    RECENT_DISTANCES = [];
    try {
      localStorage.removeItem("golfRoomRecentDistances");
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function togglePinnedDistance(v, min, max) {
    const n = clamp(Math.round(Number(v) || 0), min || 1, max || 320);
    if (!n) return;
    const exists = (PINNED_DISTANCES || []).indexOf(n) >= 0;
    PINNED_DISTANCES = exists
      ? (PINNED_DISTANCES || []).filter((d) => d !== n)
      : [n].concat(PINNED_DISTANCES || []).slice(0, 8);
    try {
      localStorage.setItem("golfRoomPinnedDistances", JSON.stringify(PINNED_DISTANCES));
    } catch (e) { /* localStorage 可能在 file:// 或隱私模式被擋 */ }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
})();
