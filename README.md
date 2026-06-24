# 彈道數據儀表板 · 讀 CSV 版 (v5)

藍白現代 UI（Codex 風格）＋ Claude 的資料分析呈現。**即時讀 `data/` 資料夾的 CSV** 計算距離梯、離散、失誤率，並自動產生分析訊號。可直接部署到 GitHub Pages。

## 結構

```
index.html              ← 介面 + 樣式
app.js                  ← 讀 CSV → 聚合 → 自動分析 → 畫圖
data/
  manifest.json         ← 場次清單（球員/日期/檔名）
  <球員>/<日期>.csv      ← 彈道儀匯出的原始 CSV
assets/golf-cat-ip/     ← 吉祥物素材
```

## ➕ 新增一筆數據（不用填表單）

1. 把彈道儀匯出的 CSV 丟進 `data/<球員代號>/`，例如 `data/renwen/2026-07-01.csv`。
2. 在 `data/manifest.json` 的對應球員 `sessions` 加一筆：
   ```json
   { "date": "2026-07-01", "file": "renwen/2026-07-01.csv", "label": "練習場", "device": "Garmin R10" }
   ```
3. commit（或在 GitHub 網頁上傳）→ Pages 自動更新，同一個網址就看到。

> 新球員：在 `players` 加一個物件即可（id 用英數）。

## 半自動匯入 workflow

目前已設定球員代號：
`tony`、`renwen`、`dondon`、`ann`、`yoyo`、`kelly`

把 CSV 放在任何本機資料夾後，可以用腳本匯入：

```bash
python3 scripts/import_session.py renwen "/path/to/2026-07-01.csv" --label "練習場"
```

需要排除某個球桿標籤時：

```bash
python3 scripts/import_session.py tony "/path/to/2026-04-01.csv" --date 2026-04-01 --exclude-club "?"
```

腳本會：

1. 檢查 CSV 必要欄位。
2. 複製到 `data/<球員代號>/`。
3. 更新 `data/manifest.json`。

確認變更後再發布：

```bash
git diff
git add data/manifest.json data/<球員代號>/*.csv
git commit -m "Add golf session data"
git push
```

## CSV 欄位需求

至少需要這幾欄（Garmin R10 中文匯出格式）：
`球桿`、`無坡落點距離-比賽球(碼)`、`無坡總距離-比賽球(碼)`、`球速(mph)`、`出球角度(度)`、`偏移`、`最高點 (英尺)`。
其他廠牌/格式欄位名不同時，需在 `app.js` 的 `parseCSV()` 調整對應。原始 `SW` 會自動正名為 `W`。

## 本機預覽

```bash
python3 -m http.server 8000   # 在本資料夾執行
# 開 http://127.0.0.1:8000
```
（不能直接雙擊 `index.html`——讀 CSV 需要 HTTP；這也是要發佈到 GitHub Pages 的原因。）

## 發佈到 GitHub Pages

1. 建一個 repo，把本資料夾所有檔案放到 repo 根目錄。
2. Settings → Pages → Source 選 `main` 分支 `/ (root)` → Save。
3. 等 1 分鐘，得到 `https://<帳號>.github.io/<repo>/` 網址。
