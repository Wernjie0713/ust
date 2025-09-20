# ECOGO! DE-IOTA INVENTORY REPORT

**Generated:** September 20, 2025  
**Branch:** refactor/no-iota  
**Project:** EcoGo! (Next.js TypeScript)

## 1. DEPENDENCIES

### Current package.json (v0.1.0)
- **No IOTA packages found** in dependencies or devDependencies
- All current packages appear clean:
  - mapbox-gl: ^3.15.0
  - next: 15.5.3
  - react: 19.1.0
  - threebox-plugin: ^2.2.7

### Environment Variables
- **No .env files found** in workspace
- No IOTA_* or DID_* environment variables detected

## 2. CODE REFERENCES

### Files Containing Banned Terms (7 files):

#### `utils/auth.ts`
- Line 6: `did?: string; // IOTA DID`
- Line 163: `did: result.data.did,`
- Line 187: `console.log('✅ User registered:', newUser.displayName, 'DID:', newUser.did);`
- Line 188: `return { success: true, userDID: newUser.did };`

#### `pages/camera.tsx`
- Line 14: `did: string;`

#### `components/notifications/MissionCompleteNotification.tsx`
- Line 12: `did: string;`

#### `components/ecomon/WalletConnect.tsx` (MOST AFFECTED - 90+ lines)
- Extensive IOTA wallet integration code
- Lines 11, 18, 19: Type definitions for IOTA/Firefly wallets
- Lines 54-56: IOTA testnet API endpoints
- Lines 131-381: IOTA wallet connection methods
- Lines 531-532: IOTA EVM testnet configuration
- Lines 634, 644: IOTA wallet detection logic

#### `components/ecomon/UserProfile.tsx`
- Line 10: `did: string;`
- Lines 264, 276, 278, 292, 295, 738, 1182: DID creation, storage, and display logic

#### `components/ecomon/RecyclingCamera.tsx`
- Line 22: `did: string;`
- Lines 222, 304, 312, 370: DID generation for demo/fallback users

#### `components/ecomon/GameHub.tsx`
- Line 10: `did: string;`
- Lines 44, 71, 98, 125, 152: Demo EcoMon DIDs

## 3. TYPE DEFINITIONS TO UPDATE

### Field Replacements Needed:
- `did` → `userId: string`
- `userDID` → `userId: string`
- `ecoMonDid` → `ecoMonId: string`

### Files requiring type updates:
- `utils/auth.ts` - User type definition
- `pages/camera.tsx` - Component props
- `components/notifications/MissionCompleteNotification.tsx` - Props
- `components/ecomon/UserProfile.tsx` - User profile types
- `components/ecomon/RecyclingCamera.tsx` - User/camera types
- `components/ecomon/GameHub.tsx` - EcoMon types

## 4. COMPONENTS TO REMOVE/MODIFY

### Delete Entirely:
- `components/ecomon/WalletConnect.tsx` (IOTA wallet integration)

### Modify:
- `components/ecomon/UserProfile.tsx` - Remove DID display, update to show UUID-based IDs
- `components/ecomon/RecyclingCamera.tsx` - Remove DID generation logic
- `components/ecomon/GameHub.tsx` - Update EcoMon ID generation

## 5. UI CLEANUP REQUIRED

### Remove:
- Wallet connection buttons and modals
- Balance displays showing IOTA tokens
- "Powered by IOTA" branding
- IOTA wallet extension detection UI

### Keep:
- EcoMon collection system
- Map functionality
- Camera/recycling features
- Rewards and achievements
- Profile (points/streaks only)

## 6. API/SERVER ROUTES NEEDED

### New Proxy Routes Required:
- `/api/map/token` - Serve Mapbox tokens server-side
- `/api/analyze` - Server-side OpenAI integration
- `/api/vouchers` - Voucher redemption proxy (if needed)

## 7. CONFIGURATION CHANGES

### Scripts to Add:
- `scan:banned` - Banned terms detector
- `smoke` - Route testing script

### Environment Variables to Add:
- `API_BASE_URL=http://localhost:3003`
- `MAPBOX_TOKEN=<server-side-only>`
- `OPENAI_API_KEY=<server-side-only>`

## 8. RISK ASSESSMENT

### High Impact:
- WalletConnect.tsx removal (entire component deletion)
- UserProfile.tsx DID removal (UI changes)
- Auth.ts type changes (affects authentication flow)

### Medium Impact:
- RecyclingCamera.tsx demo DID removal
- GameHub.tsx EcoMon ID changes
- MissionCompleteNotification.tsx props changes

### Low Impact:
- Camera.tsx prop changes
- Adding proxy routes

## 9. TESTING CONSIDERATIONS

### Routes to Test:
- `/`, `/map`, `/camera`, `/rewards`, `/achievements`, `/profile`
- `/game`, `/review`, `/recycler`, `/recycler/users`, `/recycler/camera`

### Landmark Elements for Smoke Tests:
- `#map` for map page
- Camera component presence
- Achievement/reward displays
- Profile data (points/streaks only)

---

**Total Banned Terms Found:** 90+ lines across 7 files
**Critical Components:** WalletConnect.tsx (delete), UserProfile.tsx (modify)
**Estimated Changes:** 7 files modified, 1 file deleted, 3 new API routes
