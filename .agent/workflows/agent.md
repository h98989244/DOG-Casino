---
description: Guildline of this project folder
---

## Rules
- Always use 繁體中文 來進行回答, 包含 plan, task, walkthrough
- Walkthrough 做完後, 詢問我是否更新/建立 summary.md 於該專案資料夾內, 其內容應包含佈署所動用的AWS或相對應的雲端 資源, 建立的腳色, 重新佈署的簡要步驟, 目前部署的資源id, 網址(如果有的話)
- AWS region 請使用 ap-southeast-1, 除非遇到錯誤或是明顯不合適的情況
- 如果需要跟AWS互動請使用AWS Cli完成
- 如果更新任何環境變數, 請提醒我或是直接幫我進行 scripts\update-amplify-env.ps1

## Env
- Windows Pwsh shell, most unix command line isn't there except ssh/git, especially no command "cat" exist
- Deployment dest. is AWS Amplify, Please make sure code is SSR compatiable
- use supabase MCP to update or initial db when needed.

## Setup commands
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible