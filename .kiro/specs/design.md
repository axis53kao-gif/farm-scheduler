# 垂直農場排程系統 — 設計文件

> 版本：v1.0　日期：2026-09-21
> 對應需求：requirements.md v1.0

---

## 技術決策

| 項目 | 決定 |
|------|------|
| 語言 | HTML5 / CSS3 / 原生 JavaScript（ES6+） |
| 檔案數量 | 3 個檔案：`index.html`、`styles.css`、`app.js` |
| 圖表 | 原生 SVG（甘特圖）或純 CSS 條狀圖，不引入外部套件 |
| 資料 | JavaScript 物件 hardcoded 在 `app.js` |
| 路徑 | 所有資源使用相對路徑 |
| 外部依賴 | 無（無 CDN、無 npm、無框架） |
| 發布 | GitHub Pages，來源：`main` 分支 `/docs` 資料夾 |

---

## 檔案結構

```
docs/
├── index.html   # 單一 HTML，包含兩個區塊（排程 + 看板），用錨點或 tab 切換
├── styles.css   # 全部樣式，含 RWD breakpoints
└── app.js       # 模擬資料 + 倒排邏輯 + 看板互動
```

> 將原 requirements.md 規劃的多頁結構（schedule.html / kanban.html）
> 合併為單一 index.html，以 Tab 切換兩個功能區塊，符合「簡單雛型」原則。

---

## 頁面佈局

### 整體骨架

```
<header>   標題「垂直農場排程系統」
<nav>      Tab 切換：[排程計算] [派工看板]
<main>
  <section id="schedule">  SC-01 排程計算區塊（預設顯示）
  <section id="kanban">    SC-04 派工看板區塊（切換後顯示）
<footer>   版本資訊
```

### SC-01 排程計算區塊

```
[表單]
  菜種下拉 | 重量輸入 | 交貨日期 | [計算排程] 按鈕

[錯誤訊息區]  交期已過紅色警示（條件顯示）

[結果表格]
  菜種 | 交貨日 | 定植日 | 育苗日 | 育苗天數 | 生長天數

[甘特圖區]
  以 SVG 繪製橫向時間軸，每筆訂單一列
  育苗期 = 藍色矩形；生長期 = 綠色矩形
  今日基準線 = 紅色垂直虛線
```

### SC-04 派工看板區塊

```
[頁首進度]  今日：YYYY-MM-DD｜已完成 X／Y 項

[任務卡片 Grid]
  每張卡片：
    色標邊框（播種藍／定植綠／採收橘）
    任務類型 badge | 架位 | 菜種 | 數量
    [完成] 按鈕
  完成後：卡片灰化 + 文字 line-through
```

---

## 資料結構（app.js 內 hardcoded）

### 菜種資料

```js
const CROPS = [
  { id: 'butter', name: '奶油萵苣', seedDays: 7, growDays: 18 },
  { id: 'romaine', name: '蘿蔓生菜', seedDays: 7, growDays: 21 },
  { id: 'arugula', name: '芝麻葉',   seedDays: 5, growDays: 14 },
  { id: 'pakchoi', name: '小白菜',   seedDays: 5, growDays: 16 },
];
```

### 派工任務資料

```js
const TASKS = [
  { id: 1, type: '播種', rack: 'A架1層3號板', crop: '芝麻葉',   qty: '2 盤' },
  { id: 2, type: '定植', rack: 'B架2層1號板', crop: '奶油萵苣', qty: '20 株' },
  { id: 3, type: '定植', rack: 'C架1層4號板', crop: '小白菜',   qty: '24 株' },
  { id: 4, type: '採收', rack: 'A架3層2號板', crop: '蘿蔓生菜', qty: '30 顆' },
  { id: 5, type: '採收', rack: 'B架4層1號板', crop: '奶油萵苣', qty: '25 顆' },
  { id: 6, type: '播種', rack: 'D架2層2號板', crop: '蘿蔓生菜', qty: '3 盤' },
];
```

---

## 倒排邏輯（app.js）

```
輸入：deliveryDate（交貨日）、crop（菜種物件）
輸出：transplantDate（定植日）、seedDate（育苗日）

transplantDate = deliveryDate - growDays
seedDate       = transplantDate - seedDays
```

驗證：`deliveryDate < today` → 顯示錯誤，中止計算。

---

## 甘特圖（SVG）

- 時間軸：以計算結果中最早育苗日至最晚交貨日為範圍，動態縮放至 SVG 寬度。
- 每筆訂單佔一列（row height = 32px）。
- 育苗期矩形（藍）＋生長期矩形（綠），以日數比例計算 x、width。
- 今日基準線：紅色垂直虛線 `<line stroke-dasharray>`。
- SVG 寬度設 100%，自適應容器寬度；文字標籤顯示菜種名稱。

---

## 響應式設計

| 裝置 | 寬度 | 調整 |
|------|------|------|
| 桌機 | ≥ 1024px | 表單單行、甘特圖全寬、看板 3 欄 Grid |
| 平板 | 768–1023px | 表單兩欄、看板 2 欄 Grid |
| 手機 | < 768px | 表單單欄、甘特圖橫向捲動、看板 1 欄 |

---

## 色彩規範

| 用途 | 色碼 |
|------|------|
| 主色（深綠） | `#2d6a4f` |
| 強調色（淺綠） | `#52b788` |
| 播種（藍） | `#457b9d` |
| 定植（綠） | `#52b788` |
| 採收（橘） | `#e07c24` |
| 錯誤（紅） | `#d62828` |
| 背景 | `#f8f9fa` |
| 文字 | `#212529` |
