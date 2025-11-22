# Fix Case Sensitivity Issue for Vercel Deployment

## Problem
Vercel (Linux) is case-sensitive, but Windows is not. The folder `Utils` vs `utils` is causing build failures.

## Solution Steps

### Step 1: Verify All Imports Are Correct
All imports should use `Utils` (capital U):
- ✅ `import axios from "../Utils/axiosConfig";`
- ✅ `import axios from "../../Utils/axiosConfig";`

### Step 2: Fix Git Case Sensitivity (IMPORTANT!)

Run these commands in your terminal:

```bash
# Navigate to your project root
cd "C:\Users\kunal\OneDrive\CHAT MERN"

# Remove the old lowercase folder from Git (if it exists)
git rm -r --cached frontend/src/utils 2>$null

# Add the correct uppercase folder
git add frontend/src/Utils/

# Check Git status
git status

# Commit the changes
git add -A
git commit -m "Fix: Use Utils (uppercase) folder for case-sensitive systems"

# Push to GitHub
git push origin main
```

### Step 3: Alternative Method (If Step 2 doesn't work)

If Git still has issues, use this method:

```bash
# 1. Rename the folder temporarily
git mv frontend/src/Utils frontend/src/utils_temp

# 2. Commit the rename
git commit -m "Temporary rename"

# 3. Rename back to Utils
git mv frontend/src/utils_temp frontend/src/Utils

# 4. Commit again
git commit -m "Fix: Rename utils to Utils for case sensitivity"

# 5. Push
git push origin main
```

### Step 4: Verify on GitHub

After pushing, check on GitHub:
1. Go to your repository
2. Navigate to `frontend/src/`
3. Verify the folder is named `Utils` (capital U)
4. Check that `AuthContext.jsx` has: `import axios from "../Utils/axiosConfig";`

### Step 5: Force Vercel to Rebuild

After pushing:
1. Go to Vercel dashboard
2. Click "Redeploy" on your latest deployment
3. Or trigger a new deployment

## Quick Check Command

Run this to verify all imports:
```bash
# Check all axios imports
grep -r "from.*utils/axiosConfig" frontend/src/
```

Should return NOTHING (all should use Utils with capital U)

```bash
# Check all Utils imports
grep -r "from.*Utils/axiosConfig" frontend/src/
```

Should return all 5 files with Utils (capital U)

