# AI Quiz Agent Backend

Backend proxy server to handle AI API calls and avoid CORS issues.

## Quick Setup

1. **Install dependencies:**
   ```bash
   cd backend-example
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Claude API key
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Test endpoints:**
   ```bash
   curl http://localhost:3001/health
   ```

## Deployment Options

### Railway (Recommended - Free tier)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Vercel
```bash
npm install -g vercel
vercel
```

### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Heroku
```bash
heroku create your-app-name
heroku config:set CLAUDE_API_KEY=your-key
git push heroku main
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/analyze` - Document analysis
- `POST /api/extract-terms` - Extract English terms
- `POST /api/generate-questions` - Generate quiz questions

## Frontend Integration

Update your frontend `.env.production`:
```
VITE_BACKEND_API_URL=https://your-deployed-backend.com
VITE_USE_MOCK_API=false
```