# AI Quiz Agent

An intelligent quiz generator that creates custom quizzes from your documents using AI technology.

## Features

- 📄 **Document Upload**: Support for TXT, MD, PDF, and DOCX files
- 🧠 **AI-Powered Analysis**: Automatic document analysis and content extraction
- 🌐 **English Terms Extraction**: Automatically extracts and translates technical terms
- 📊 **Smart Question Generation**: Creates relevant multiple-choice questions based on document content
- 📈 **Progress Tracking**: Real-time quiz progress and score tracking
- 🔄 **Retry System**: Review and retry incorrect answers
- 💾 **Export Terms**: Download extracted English terms as JSON

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-quiz-agent.git
cd ai-quiz-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Claude API key:
```
VITE_CLAUDE_API_KEY=your_actual_api_key_here
```

## Development

Run the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Environment Configuration

The following environment variables can be configured in `.env`:

- `VITE_CLAUDE_API_KEY`: Your Claude API key (required for production)
- `VITE_CLAUDE_API_URL`: Claude API endpoint
- `VITE_ENABLE_ENGLISH_TERMS_EXTRACTION`: Enable/disable English terms extraction
- `VITE_MAX_QUESTIONS_PER_QUIZ`: Maximum questions per quiz (default: 20)
- `VITE_MIN_QUESTIONS_PER_QUIZ`: Minimum questions per quiz (default: 5)
- `VITE_MAX_FILE_SIZE`: Maximum file upload size in bytes
- `VITE_API_TIMEOUT`: API request timeout in milliseconds

## Mock Mode

When no API key is configured or in development mode, the app uses mock data for testing purposes.

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- Lucide React (icons)
- Claude AI API

## License

ISC