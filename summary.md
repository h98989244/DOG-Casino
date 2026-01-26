# Project Summary

## Deployment Information
- **Platform**: AWS Amplify
- **Region**: ap-southeast-1
- **App ID**: `d2jf0g0ejbn3x1`
- **URL**: [https://main.d2jf0g0ejbn3x1.amplifyapp.com](https://main.d2jf0g0ejbn3x1.amplifyapp.com)
- **Status**: **SUCCEED** (Last verified: 2026-01-27T01:55:16+08:00)

## Recent Changes
### Deposit Page Fix (Login Issue)
- **Problem**: Users logged in via LINE were unable to deposit because `useAuth` (Supabase Auth) was null.
- **Solution**:
    - **Frontend**: Updated `DepositPage.tsx` to use `useUserProfile` (localStorage) for auth checks.
    - **Backend**: Implemented `create-deposit` Edge Function.
    - **Security**: The Edge Function verifies the LINE `idToken` directly with LINE servers before creating the transaction with Service Role permissions, bypassing RLS limitations.

### Fishing Game Implementation
- **Core Engine**: A TypeScript-based physics engine (`FishingEngine`) for handling fish movement (Bezier curves), collision detection, and particle effects.
- **UI Components**: Modern React components using Tailwind CSS for HUD, menus, and modals (Settings, Recharge, Gifts).
- **Responsive Design**: Auto-scaling Canvas to support both desktop and mobile viewports.
- **Integration**: Added to the main App routing (`/fishing`) and accessible via the Game Lobby.

## Deployment Steps (Executed)
1.  **Commit**: `Fix DepositPage login issue by using local profile and edge function`
2.  **Push**: Pushed to `origin/main` branch.
3.  **Build**: AWS Amplify processed the build.
4.  **Result**: Deployment **SUCCEEDED** at `2026-01-27T01:55:13`.

## Resources Used
- **Compute**: AWS Amplify Hosting.
- **Storage**: Amplify artifact storage (S3).
- **Functions**:
    - `line-login`: Handles initial LINE login and user creation/update.
    - `create-deposit`: **[NEW]** Handles deposit creation by verifying LINE ID Token (bypasses RLS).
