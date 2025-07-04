# Quick Fix for crypto.hash Error

## The Problem
Vite 7.0.2 has a Node.js compatibility issue with `crypto.hash` function.

## Solution: Downgrade to Vite 4.4.5

### Step 1: Check your Node.js version
```bash
node --version
```
If you're using Node.js 20+, this is likely the issue.

### Step 2: Fix the dependencies
```bash
cd /mnt/d/02_Projects/01_PersonalProjects/ai-quiz-agent

# Remove the problematic packages
rm -rf node_modules package-lock.json

# Copy the fixed package.json
cp package-fixed.json package.json

# Install compatible versions
npm install
```

### Step 3: Alternative - Use specific versions
If the above doesn't work, manually install specific versions:
```bash
npm uninstall vite @vitejs/plugin-react
npm install vite@4.4.5 @vitejs/plugin-react@4.0.3
```

### Step 4: Use Node.js 18 (Recommended)
```bash
# If you have nvm (Node Version Manager)
nvm install 18
nvm use 18
npm run dev
```

### Step 5: Alternative - Use npx with older Vite
```bash
npx vite@4.4.5 dev
```

### Emergency Solution: Use Create React App
If all else fails:
```bash
cd /mnt/d/02_Projects/01_PersonalProjects/
npx create-react-app ai-quiz-agent-cra
cd ai-quiz-agent-cra
# Copy your src/ folder from the original project
npm start
```

## Root Cause
The `crypto.hash` function was added in Node.js v19, but Vite 7 expects it to be available. Using Vite 4.4.5 with Node.js 18 is the most stable combination.