# 專案資料夾結構規則

後續請依以下的資料結構放置檔案：

```
專案資料夾/
├── .kiro/
│   ├── steering/
│   ├── skills/
│   ├── settings/
│   ├── hooks/
│   └── specs/
├── docs/
│   ├── index.html
│   ├── styles.css
```

---

# 開發規範

- 純 HTML／CSS／JavaScript，不使用任何框架
- 網站檔案一律放在 `docs/` 資料夾
- 不使用 Node.js、Vite、前端框架與外部 API
- 資料使用模擬資料（hardcoded），介面語言使用繁體中文
- 版面須支援響應式設計（RWD）
- 發布方式：GitHub Pages，來源設定為 `main` 分支的 `docs/` 資料夾
