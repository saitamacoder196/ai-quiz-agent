#!/bin/bash

echo "🚀 Fixing Railway deployment issues..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "backend-example/server.js" ]; then
    echo "❌ Please run this script from the ai-quiz-agent root directory"
    exit 1
fi

cd backend-example

echo "📦 Fixing package.json dependencies..."
cp package-fixed.json package.json

echo "🔧 Using compatible server.js..."
cp server-fixed.js server.js

echo "🧹 Cleaning up node_modules..."
rm -rf node_modules package-lock.json

echo "📋 Testing package installation locally..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    
    echo "🚀 Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo ""
        echo "Next steps:"
        echo "1. Set your CLAUDE_API_KEY in Railway dashboard"
        echo "2. Test the health endpoint: curl https://your-app.railway.app/health"
        echo "3. Update your frontend .env.production with the Railway URL"
    else
        echo "❌ Railway deployment failed"
        echo "Try checking the Railway dashboard for more details"
    fi
else
    echo "❌ Local dependency installation failed"
    echo "Check if you have the latest npm/node versions"
fi