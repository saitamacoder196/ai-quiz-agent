#!/bin/bash

echo "🔧 Fixing AI Quiz Agent project compatibility issues..."

# Navigate to your project directory
cd /mnt/d/02_Projects/01_PersonalProjects/ai-quiz-agent

# Backup current package.json
cp package.json package.json.backup

# Remove problematic node_modules and package-lock.json
echo "🗑️ Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Copy fixed configuration files
echo "📋 Copying fixed configuration files..."
cp /data/data/com.termux/files/home/ai-quiz-agent/package-fixed.json ./package.json
cp /data/data/com.termux/files/home/ai-quiz-agent/tailwind-fixed.config.js ./tailwind.config.js
cp /data/data/com.termux/files/home/ai-quiz-agent/postcss-fixed.config.js ./postcss.config.js
cp /data/data/com.termux/files/home/ai-quiz-agent/vite-fixed.config.js ./vite.config.js

# Install compatible dependencies
echo "📦 Installing compatible dependencies..."
npm install

# Initialize Tailwind CSS
echo "🎨 Initializing Tailwind CSS..."
npx tailwindcss init -p

echo "✅ Project fixed! You can now run:"
echo "   npm run dev"
echo "   npm run build"

echo ""
echo "🔄 If you still have issues, try using Node.js v18 or v16:"
echo "   nvm use 18"
echo "   npm run dev"