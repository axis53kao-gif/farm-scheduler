# 垂直農場排程系統 — 實作任務清單

> 版本：v1.1　日期：2026-09-21
> 對應設計：design.md v1.0
> 開發原則：每個 Task 可獨立開發、驗證與 Commit。

---

## Task 1　HTML 骨架與頁面結構　✅ 完成

**目標**：建立三個檔案的空殼，確認頁面能在瀏覽器開啟且結構正確。

**交付檔案**
- `docs/index.html`
- `docs/styles.css`（空白，僅 reset）
- `docs/app.js`（空白，僅一行 console.log）

**實作項目**
- [x] 建立 `docs/` 資料夾
- [x] `index.html`：`<head>` 引用 `styles.css`（相對路徑）與 `app.js`（defer）
- [x] 撰寫 `<header>`：顯示「垂直農場排程系統」標題
- [x] 撰寫 `<nav>`：兩個 Tab 按鈕「排程計算」與「派工看板」
- [x] 撰寫 `<main>`：兩個 `<section>`，id 分別為 `schedule` 與 `kanban`
- [x] SC-01 `#schedule`：含表單（菜種下拉、重量輸入、日期選擇器、計算按鈕）、錯誤訊息區、結果表格佔位、甘特圖佔位
- [x] SC-04 `#kanban`：含進度列、任務卡片容器
- [x] `<footer>`：版本與說明文字
- [x] Tab 切換邏輯：預設顯示 `#schedule`，點 Tab 後切換 section 顯示/隱藏（純 JS，無框架）

**Commit**：`feat: Task1 HTML骨架與Tab切換`

---

## Task 2　CSS 版面與響應式樣式　✅ 完成

**目標**：完成 `styles.css` 全部樣式，涵蓋 RWD 三個斷點，頁面視覺完整。

**交付檔案**
- `docs/styles.css`（完整版）

**實作項目**
- [x] CSS Reset：`box-sizing: border-box`、margin/padding 歸零
- [x] 色彩變數：CSS custom properties（`--color-primary` 等，對應 design.md）
- [x] Header：深綠背景、白色標題文字、置中
- [x] Nav Tab：兩個按鈕並排，active 狀態底線區分
- [x] 表單佈局：桌機 4 欄、平板 2 欄、手機 1 欄
- [x] 錯誤訊息：紅色背景，預設 `.hidden`
- [x] 結果表格：全寬、交替列底色、手機橫向捲動
- [x] 甘特圖容器：`overflow-x: auto`
- [x] 任務卡片 Grid：桌機 3 欄、平板 2 欄、手機 1 欄
- [x] 任務卡片：左側色條（播種藍／定植綠／採收橘）、badge、`.done` 灰化
- [x] Footer：淺灰背景、小字、置中
- [x] Media queries：`max-width: 767px`、`max-width: 1023px`

**Commit**：`feat: Task2 CSS版面與RWD樣式`

---

## Task 3　模擬資料、倒排邏輯與甘特圖　✅ 完成

**目標**：完成 `app.js` 的資料定義、SC-01 倒排計算邏輯與 SVG 甘特圖渲染。

**交付檔案**
- `docs/app.js`（資料 + 排程邏輯 + 甘特圖 + 看板）

**實作項目**
- [x] 定義 `CROPS` 陣列（4 筆菜種，含 seedDays / growDays）
- [x] 定義 `TASKS` 陣列（6 筆派工任務）
- [x] 倒排函式 `calcSchedule(deliveryDateStr, crop)`
- [x] 表單提交事件：交期驗證 + 倒排計算 + 結果表格更新
- [x] `renderGantt(results)`：原生 SVG、育苗期矩形（藍）、生長期矩形（綠）、今日紅色基準線

**Commit**：`feat: Task3 模擬資料、倒排邏輯與甘特圖`

---

## Task 4　派工看板互動與整合驗收　✅ 完成

**目標**：確認 SC-04 看板渲染、完成按鈕互動正常，執行全頁整合驗收。

**實作項目**
- [x] `initKanban()`：以 `TASKS` 陣列動態產生 6 張任務卡片
- [x] 每張卡片依 type 套用 `.type-seeding` / `.type-planting` / `.type-harvest`
- [x] 卡片顯示：任務類型 badge、架位、菜種、數量、完成按鈕
- [x] 完成按鈕事件委派：加 `.done` class，更新進度列計數
- [x] 進度列初始顯示「已完成 0／6 項」

**整合驗收（40/40 PASS）**
- [x] 三個檔案均存在，無外部資源引用
- [x] 所有路徑為相對路徑
- [x] HTML 結構完整（header / nav / section#schedule / section#kanban / footer）
- [x] JS：CROPS 4筆、TASKS 6筆、calcSchedule、addDays 倒排、交期驗證、SVG createElementNS、今日基準線 stroke-dasharray、initKanban、事件委派、.done class、doneCount 更新、DOMContentLoaded、無 fetch/import
- [x] CSS：CSS 變數、RWD 767px/1023px、tab-content.active、task-card、三種色標、.done 灰化、overflow-x auto、task-list grid

**Commit**：`feat: Task4 派工看板互動與整合驗收`

---

## 任務依賴關係

```
Task 1（HTML 骨架）
    └─→ Task 2（CSS 樣式）  ─→ 可平行
    └─→ Task 3（JS 邏輯）   ─→ 可平行
              └─→ Task 4（整合驗收）← 需 Task 1~3 全完成
```
