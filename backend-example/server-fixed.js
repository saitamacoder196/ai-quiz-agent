const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Quiz Agent Backend API',
    endpoints: ['/health', '/api/analyze', '/api/extract-terms', '/api/generate-questions']
  });
});

// Analyze document endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 50000) {
      return res.status(400).json({ error: 'Prompt too long (max 50k characters)' });
    }

    console.log('📝 Analyzing document, prompt length:', prompt.length);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].text;
    console.log('✅ Analysis completed, response length:', response.length);

    res.json({ response });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    if (error.status === 429) {
      res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
    } else if (error.status === 401) {
      res.status(500).json({ error: 'API authentication failed. Check your API key.' });
    } else if (error.status === 400) {
      res.status(400).json({ error: 'Invalid request to Claude API.' });
    } else {
      res.status(500).json({ 
        error: 'Analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Extract English terms endpoint
app.post('/api/extract-terms', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('🔍 Extracting terms, prompt length:', prompt.length);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].text;
    console.log('✅ Terms extraction completed');

    res.json({ response });

  } catch (error) {
    console.error('❌ Terms extraction error:', error);
    res.status(500).json({ 
      error: 'Terms extraction failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate questions endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('🎯 Generating questions, prompt length:', prompt.length);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 3000,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].text;
    console.log('✅ Questions generation completed');

    res.json({ response });

  } catch (error) {
    console.error('❌ Questions generation error:', error);
    res.status(500).json({ 
      error: 'Questions generation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Quiz Agent Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Claude API configured: ${!!process.env.CLAUDE_API_KEY}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});