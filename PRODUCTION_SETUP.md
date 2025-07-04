# Production Setup Guide

## Overview
To use real AI analysis instead of mock data, you need to set up API keys and handle CORS properly.

## ⚠️ Important: CORS Issue in Production

Direct browser calls to AI APIs (like Claude) will fail due to CORS policy. You have **two options**:

### Option 1: Backend Proxy (Recommended)
Create a backend server that acts as a proxy to call AI APIs.

### Option 2: Direct API with CORS Workaround (Not Recommended)
Use browser extensions or modify API calls (less secure).

## 🚀 Option 1: Backend Proxy Setup (Recommended)

### Step 1: Create Backend Server
```bash
# Create a simple Express.js backend
mkdir ai-quiz-backend
cd ai-quiz-backend
npm init -y
npm install express cors dotenv @anthropic-ai/sdk
```

### Step 2: Backend Code (server.js)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.use(cors());
app.use(express.json());

// Analyze document endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    
    res.json({ response: message.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

### Step 3: Deploy Backend
```bash
# Deploy to Railway (free)
npm install -g @railway/cli
railway login
railway init
railway up

# Or deploy to Vercel
npm install -g vercel
vercel

# Or deploy to Render/Heroku
```

### Step 4: Update Frontend Environment
```bash
# Copy production environment template
cp .env.example.production .env.production

# Edit .env.production and add:
VITE_BACKEND_API_URL=https://your-deployed-backend.com/api
VITE_USE_MOCK_API=false
```

### Step 5: Update Frontend API Calls
```javascript
// In your component, update callClaudeAPI function:
const callClaudeAPI = async (prompt) => {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    // Use mock API
    const { mockClaudeAPI } = await import('../utils/api.js');
    return await mockClaudeAPI(prompt);
  }

  // Use backend proxy
  const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  return data.response;
};
```

## 🔧 Option 2: Direct API (Advanced)

### Step 1: Get Claude API Key
1. Visit https://console.anthropic.com/
2. Create account and add payment method
3. Generate API key
4. Copy to `.env.production`

### Step 2: Update Environment
```bash
# In .env.production
VITE_CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1/messages
VITE_USE_MOCK_API=false
```

### Step 3: Handle CORS (Choose one)

#### Method A: CORS Browser Extension (Development Only)
Install "CORS Unblock" extension in Chrome for testing.

#### Method B: Use Proxy Service
```javascript
// Use a CORS proxy service (not recommended for production)
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = proxyUrl + import.meta.env.VITE_CLAUDE_API_URL;
```

#### Method C: Deploy with CORS Headers
Deploy your frontend to a platform that can add CORS headers.

## 📋 Complete Production Checklist

### 1. Environment Setup
- [ ] Copy `.env.example.production` to `.env.production`
- [ ] Add real Claude API key
- [ ] Configure backend URL (if using proxy)
- [ ] Set `VITE_USE_MOCK_API=false`

### 2. API Integration
- [ ] Deploy backend proxy server (recommended)
- [ ] Test API calls work without CORS errors
- [ ] Verify AI responses are realistic
- [ ] Test with real documents

### 3. Deployment
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Railway/Render
- [ ] Configure environment variables on hosting platform
- [ ] Test production build locally first

### 4. Testing
- [ ] Upload various document types
- [ ] Test analysis and question generation
- [ ] Verify English terms extraction
- [ ] Check error handling

### 5. Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Monitor API usage and costs
- [ ] Set up uptime monitoring

## 💡 Quick Start Commands

```bash
# 1. Pull latest code
git pull origin main

# 2. Set up production environment
cp .env.example.production .env.production
# Edit .env.production with your API keys

# 3. Test production build locally
npm run build
npm run preview

# 4. Deploy
# Frontend: Push to Vercel/Netlify
# Backend: Deploy proxy server

# 5. Update DNS and test live site
```

## 🔐 Security Notes

1. **Never commit API keys** to Git
2. **Use environment variables** for all secrets
3. **Set up rate limiting** to prevent abuse
4. **Monitor API usage** to control costs
5. **Use HTTPS** for all endpoints
6. **Validate all inputs** on backend

## 📞 Support

If you need help with production setup:
1. Check GitHub Issues
2. Review API documentation
3. Test with minimal examples first
4. Monitor browser network tab for errors