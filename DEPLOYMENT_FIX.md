# Railway Deployment Fix

## Issue
The Railway deployment failed due to an incompatible `rate-limiter-flexible` package version.

## Quick Fix

### Option 1: Use the Fix Script
```bash
# From ai-quiz-agent root directory
./railway-deploy-fix.sh
```

### Option 2: Manual Fix
```bash
cd backend-example

# Replace package.json with fixed version
cp package-fixed.json package.json

# Replace server.js with fixed version
cp server-fixed.js server.js

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Deploy again
railway up
```

## What Was Fixed

1. **Replaced `rate-limiter-flexible`** with `express-rate-limit` (more compatible)
2. **Updated Anthropic SDK** to a stable version (^0.20.0)
3. **Simplified dependencies** to avoid version conflicts
4. **Added better error handling** for production

## After Successful Deployment

1. **Set Environment Variables in Railway:**
   - Go to Railway dashboard
   - Find your deployed service
   - Go to Variables tab
   - Add: `CLAUDE_API_KEY=sk-ant-api03-your-actual-key`

2. **Test the Backend:**
   ```bash
   curl https://your-app.railway.app/health
   ```

3. **Update Frontend:**
   ```bash
   # In your frontend .env.production
   VITE_BACKEND_API_URL=https://your-app.railway.app
   VITE_USE_MOCK_API=false
   ```

## Alternative Deployment Platforms

If Railway continues to have issues, try these alternatives:

### Render (Free Tier)
1. Connect GitHub repository
2. Choose "Web Service"
3. Set build command: `cd backend-example && npm install`
4. Set start command: `cd backend-example && npm start`
5. Add environment variable: `CLAUDE_API_KEY`

### Vercel (Serverless)
```bash
cd backend-example
npm install -g vercel
vercel
```

### Heroku
```bash
cd backend-example
heroku create your-app-name
heroku config:set CLAUDE_API_KEY=your-key
git subtree push --prefix backend-example heroku main
```

## Testing Your Backend

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-backend-url/health

# Test analysis (replace with your URL)
curl -X POST https://your-backend-url/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is machine learning?"}'
```

## Frontend Integration

After backend is deployed, update your frontend:

```javascript
// In your component, the API calls will now use real backend:
const callClaudeAPI = async (prompt) => {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    // Mock API
    const { mockClaudeAPI } = await import('../utils/api.js');
    return await mockClaudeAPI(prompt);
  }

  // Real backend API
  const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
};
```