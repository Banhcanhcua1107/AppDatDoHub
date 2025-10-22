# 📱 My Expo App - Installation & Setup Guide

**Project:** Restaurant Management System (Quản Lý Nhà Hàng)  
**Platform:** React Native + Expo  
**Target Devices:** Android, iOS

---

## 🎯 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) - Verify: `npm -v`
- **Expo CLI** - Install: `npm install -g expo-cli`
- **Android Studio** (for Android emulator) - [Download](https://developer.android.com/studio)
- **Xcode** (for iOS, macOS only) - [Download](https://apps.apple.com/app/xcode/id497799835)

### Verify Installation
```powershell
# PowerShell - Check all installed
node --version          # Should show v16+
npm --version           # Should show 8+
expo --version          # Should show 53+
```

---

## 🚀 Installation Steps

### Step 1: Clone/Navigate to Project
```powershell
cd d:\DoAnChuyenNganh\my-expo-app
```

### Step 2: Install Dependencies
```powershell
npm install
```

**Expected output:**
```
added XXX packages, and audited XXX packages in XXXs
```

If you get permission errors on Windows, run PowerShell as Administrator.

### Step 3: Install Type Definitions (TypeScript)
```powershell
npm install --save-dev @types/react @types/react-native
```

### Step 4: Set Up Environment Variables

Create a `.env` file in project root:
```powershell
# PowerShell
@"
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
"@ | Out-File -Encoding UTF8 .env
```

Or create file manually:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these values from Supabase dashboard:**
1. Go to [Supabase](https://supabase.com/)
2. Select your project
3. Settings → API → Copy `Project URL` and `anon public` key

### Step 5: Clear Cache (if needed)
```powershell
# Clear npm cache
npm cache clean --force

# Clear Expo cache
expo start --clear
```

---

## 🏃 Running the App

### Option A: Start Development Server
```powershell
expo start --clear
```

**Output:** Shows QR code + menu

```
> Press a - to open Android Emulator
> Press w - to open Web Preview
> Press i - to open iOS Simulator (macOS only)
> Press q - to quit
```

### Option B: Direct Android Run
```powershell
npx expo run:android
```

### Option C: Direct iOS Run (macOS only)
```powershell
npx expo run:ios
```

---

## 📋 Database Schema - Orders Table

For transactions feature to work, your Supabase `orders` table must have these columns:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  table_name TEXT,
  user_name TEXT,                    -- Staff/Cashier name
  status TEXT DEFAULT 'completed',   -- 'completed', 'cancelled', 'pending'
  total_amount DECIMAL OR amount DECIMAL OR total DECIMAL,
  items_count INTEGER OR item_count INTEGER OR quantity INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** Column names are flexible - code auto-detects:
- Amount: `total_amount`, `amount`, or `total`
- Items: `items_count`, `item_count`, or `quantity`
- User: `user_name`, `username`, `staff`, or `cashier`

---

## 🔧 Troubleshooting

### Problem 1: "Module 'react' not found"
**Solution:**
```powershell
npm install --force
npm install --save-dev @types/react @types/react-native
```

### Problem 2: Port 8081 already in use
**Solution:**
```powershell
# Kill process using port 8081
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue).OwningProcess | Stop-Process -Force

# OR use different port
expo start --port 8082
```

### Problem 3: Android Emulator won't start
**Solution:**
```powershell
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_4_API_31 -writable-system
```

### Problem 4: App crashes with "React context error"
**Solution:**
```powershell
# Full clean rebuild
expo start --clear
# Then restart emulator completely
```

### Problem 5: "column orders.total_amount does not exist"
**Solution:**  
Check your Supabase `orders` table schema. If column names differ:
- Edit `services/reportService.ts` - `getTransactions()` function
- Update SELECT query with correct column names
- Code automatically tries alternate names (see Database Schema section)

### Problem 6: Transactions show "Unknown" user
**Solution:**  
1. Verify `orders` table has `user_name` column
2. Check if data is actually being inserted
3. Run in Supabase SQL:
```sql
SELECT id, user_name, created_at, total_amount 
FROM orders 
LIMIT 10;
```

### Problem 7: TypeScript errors in VS Code
**Solution:**
```powershell
# Restart TypeScript Server
# In VS Code: Press Ctrl+Shift+P → "TypeScript: Restart TS Server"

# OR manually clear cache
Remove-Item -Recurse -Force node_modules/.cache
```

---

## 🧹 Clean Installation (Nuclear Option)

If everything is broken:

```powershell
# 1. Remove dependencies and cache
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force

# 2. Reinstall
npm install

# 3. Clear Expo cache
expo start --clear

# 4. Rebuild
npx expo prebuild --clean
```

---

## 📚 Project Structure

```
my-expo-app/
├── screens/
│   ├── Cashier/
│   │   ├── ProfitDetailScreen.tsx          # Profit analytics
│   │   ├── SalesDetailScreen.tsx           # Sales + Transactions
│   │   ├── InventoryDetailScreen.tsx       # Inventory status
│   │   └── CashFundScreen.tsx              # Cash flow
│   └── Kitchen/
│       └── ItemAvailabilityScreen.tsx      # Item availability
├── services/
│   ├── reportService.ts                    # API functions
│   ├── supabase.ts                         # Supabase config
│   └── ...
├── components/
│   └── ...
├── package.json                            # Dependencies
├── tsconfig.json                           # TypeScript config
├── .env                                    # Environment variables
└── README.md                               # This file
```

---

## 🔍 Debugging Tips

### View Console Logs
In Expo CLI:
```
Press 'j' to open debugger in browser
OR use adb (Android)
```

### Check Supabase Connection
```powershell
# In app, open DevTools:
# Ctrl+Shift+I (if web preview)
# Check Console tab for API logs
```

### Monitor Network Requests
```
Expo DevTools → Network tab
Look for API calls to Supabase (get_sales_report, get_profit_report, etc.)
```

---

## ✅ Quick Start Summary

```powershell
# 1. Install dependencies
npm install

# 2. Set up .env with Supabase credentials
# (Create .env file manually or use editor)

# 3. Start development server
expo start --clear

# 4. Press 'a' to open Android emulator
# OR 'w' for web preview
```

---

## 📞 Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `expo start --clear` | Start dev server + clear cache |
| `npx expo run:android` | Build and run on Android |
| `npx expo run:ios` | Build and run on iOS |
| `npm run lint` | Check code style |
| `npm run type-check` | Check TypeScript errors |
| `expo prebuild --clean` | Rebuild native projects |

---

## 🎓 Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

## 📝 Notes

- **First launch takes 5-10 minutes** to download dependencies and build
- **Keep .env file private** - don't commit to git
- **Hot reload enabled** - changes appear instantly (usually)
- **Database changes** require full rebuild sometimes

---

**Last Updated:** October 22, 2025  
**Version:** 1.0  

Questions? Check error messages in console - they usually explain what's wrong! 🚀
