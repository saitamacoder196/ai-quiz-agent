const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};

app.use(rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Analyze document endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 50000) {
      return res.status(400).json({ error: 'Prompt too long' });
    }

    console.log('📝 Analyzing document, prompt length:', prompt.length);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Use faster, cheaper model
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
      res.status(500).json({ error: 'API authentication failed' });
    } else {
      res.status(500).json({ error: 'Analysis failed. Please try again.' });
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
    res.status(500).json({ error: 'Terms extraction failed' });
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
    res.status(500).json({ error: 'Questions generation failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Quiz Agent Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Claude API configured: ${!!process.env.CLAUDE_API_KEY}`);
});