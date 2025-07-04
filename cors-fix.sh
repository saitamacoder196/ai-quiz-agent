#!/bin/bash

echo "🔧 Fixing CORS issue and forcing Mock API usage"
echo "=============================================="

PROJECT_DIR="/mnt/d/02_Projects/01_PersonalProjects/ai-quiz-agent"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "Please update the PROJECT_DIR variable in this script"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📋 Creating .env.development to force mock API..."
cat > .env.development << 'EOF'
# Development Environment - Forces Mock API
VITE_APP_ENVIRONMENT=development
VITE_USE_MOCK_API=true
VITE_CLAUDE_API_KEY=mock_development_key
VITE_CLAUDE_API_URL=mock

# Application Settings
VITE_APP_NAME=AI Quiz Agent
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ENGLISH_TERMS_EXTRACTION=true
VITE_MAX_QUESTIONS_PER_QUIZ=20
VITE_MIN_QUESTIONS_PER_QUIZ=5

# File Upload Settings
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.pdf,.docx,.txt,.md

# API Timeout Settings
VITE_API_TIMEOUT=30000
EOF

echo "🔄 Updating .env to use mock API..."
cat > .env << 'EOF'
# AI Configuration - Mock API for development
VITE_CLAUDE_API_KEY=mock_development_key
VITE_CLAUDE_API_URL=mock
VITE_USE_MOCK_API=true

# Application Settings
VITE_APP_NAME=AI Quiz Agent
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ENGLISH_TERMS_EXTRACTION=true
VITE_MAX_QUESTIONS_PER_QUIZ=20
VITE_MIN_QUESTIONS_PER_QUIZ=5

# File Upload Settings
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.pdf,.docx,.txt,.md

# API Timeout Settings
VITE_API_TIMEOUT=30000
EOF

echo "🔄 Stopping current dev server..."
pkill -f "vite"

echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite

echo "✅ CORS fix completed!"
echo ""
echo "Now run:"
echo "   npm run dev"
echo ""
echo "The app will now use Mock API and avoid CORS issues."
echo "Check browser console to confirm 'Using mock API' messages."