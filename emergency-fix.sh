#!/bin/bash

echo "🚨 Emergency Fix for crypto.hash Error"
echo "======================================"

PROJECT_DIR="/mnt/d/02_Projects/01_PersonalProjects/ai-quiz-agent"

echo "📍 Navigating to project directory..."
cd "$PROJECT_DIR" || exit 1

echo "🗑️ Removing problematic node_modules and lock file..."
rm -rf node_modules package-lock.json

echo "📦 Installing specific compatible versions..."
npm install react@18.2.0 react-dom@18.2.0 lucide-react@0.263.1
npm install -D vite@4.4.5 @vitejs/plugin-react@4.0.3 tailwindcss@3.3.3 postcss@8.4.27 autoprefixer@10.4.14

echo "🔧 Updating package.json scripts..."
cat > package.json << 'EOF'
{
  "name": "ai-quiz-agent",
  "version": "1.0.0",
  "description": "AI-powered quiz generator from documents",
  "main": "index.js",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "keywords": ["quiz", "ai", "react", "education"],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}
EOF

echo "⚙️ Creating compatible vite.config.js..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
EOF

echo "🎨 Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

echo "📝 Creating postcss.config.js..."
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "🔄 Installing dependencies..."
npm install

echo ""
echo "✅ Fix completed! Try running:"
echo "   npm run dev"
echo ""
echo "💡 If you still get errors, try:"
echo "   nvm use 18  (if you have nvm)"
echo "   node --version  (should be 18.x or 16.x)"