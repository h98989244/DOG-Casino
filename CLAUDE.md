# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

汪汪娛樂城 — React + TypeScript 線上遊戲平台，整合 LINE 登入、Supabase 後端、AWS Amplify 部署。

## 常用指令

```bash
pnpm dev          # 啟動開發伺服器 (port 5173)
pnpm build        # TypeScript 檢查 + Vite 打包
pnpm preview      # 預覽 production build
pnpm lint         # ESLint 檢查 (ts,tsx，零警告)
```

## 技術架構

- **前端**: React 18 + TypeScript 5 + Tailwind CSS 3 + React Router v7
- **後端**: Supabase (PostgreSQL + Edge Functions，Deno runtime)
- **認證**: LINE LIFF SDK（主要）+ Supabase Auth（備用）
- **部署**: AWS Amplify (ap-southeast-1)，artifacts 從 `dist/` 輸出
- **套件管理**: pnpm

## 路徑別名

`@/` → `./src/`（在 vite.config.ts 和 tsconfig.json 中設定）

## 關鍵架構

### 路由與版面

`App.tsx` 管理所有路由和響應式版面。桌面版使用側邊欄 + grid，手機版使用 `BottomNav`。全螢幕遊戲（如捕魚）會隱藏導覽列。

### 認證流程

LINE LIFF 登入 → Edge Function `line-login` 驗證 idToken → Supabase 建立/更新使用者 → localStorage 保存 profile。

### 資料層

- Custom hooks (`src/hooks/`) 負責從 Supabase 取資料
- 沒有使用全域狀態管理（Redux/Zustand），用 React hooks + localStorage
- Supabase 資料表：user_profiles, transactions, bets, promotions, vip_levels 等
- Edge Functions 處理敏感操作（LINE token 驗證、建立存款）

### 遊戲引擎

- **捕魚遊戲** (`src/game/fishing/`): Canvas 渲染 + 物理引擎（Bezier 曲線移動、碰撞偵測、粒子效果）
- **拉霸機** (`src/pages/SlotMythCoinPage.tsx`): 神話金幣拉霸
- **遊戲註冊表** (`src/games/_registry.ts`): 集中管理遊戲目錄，提供 `getGameById()`, `getGamesByType()`

### Supabase Edge Functions

位於 `supabase/functions/`，使用 Deno runtime。需要 Service Role Key 繞過 RLS。共用 CORS 設定在 `_shared/cors.ts`。

## 環境變數

前端用 `VITE_` 前綴的變數（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_LIFF_ID）。敏感金鑰（SUPABASE_SERVICE_ROLE_KEY）僅供 Edge Functions 使用。
