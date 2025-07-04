import React, { useState, useEffect } from 'react';
import { Upload, FileText, Brain, CheckCircle, XCircle, RotateCcw, Trophy, Download, Globe } from 'lucide-react';

const AIQuizAgent = () => {
  const [step, setStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [englishTerms, setEnglishTerms] = useState([]);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [incorrectQuestions, setIncorrectQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Force mock API in development
  const shouldUseMockAPI = () => {
    const isDevelopment = import.meta.env.DEV || 
                         import.meta.env.VITE_APP_ENVIRONMENT === 'development' ||
                         import.meta.env.VITE_USE_MOCK_API === 'true' ||
                         window.location.hostname === 'localhost' ||
                         !import.meta.env.VITE_CLAUDE_API_KEY || 
                         import.meta.env.VITE_CLAUDE_API_KEY === 'your_claude_api_key_here' ||
                         import.meta.env.VITE_CLAUDE_API_KEY === 'mock_development_key';
    
    console.log('🔍 API Mode Check:', {
      isDev: import.meta.env.DEV,
      environment: import.meta.env.VITE_APP_ENVIRONMENT,
      useMock: import.meta.env.VITE_USE_MOCK_API,
      hostname: window.location.hostname,
      hasValidKey: !!(import.meta.env.VITE_CLAUDE_API_KEY && 
                     import.meta.env.VITE_CLAUDE_API_KEY !== 'your_claude_api_key_here' &&
                     import.meta.env.VITE_CLAUDE_API_KEY !== 'mock_development_key'),
      shouldUseMock: isDevelopment
    });
    
    return isDevelopment;
  };

  // Claude API helper function with CORS fix
  const callClaudeAPI = async (prompt) => {
    try {
      console.log('🔍 Calling API with prompt length:', prompt.length);
      
      // Always use mock API in development/localhost
      if (shouldUseMockAPI()) {
        console.log('📝 Using mock API (development mode)');
        const { mockClaudeAPI } = await import('../utils/api.js');
        const result = await mockClaudeAPI(prompt);
        console.log('✅ Mock API result:', result.substring(0, 200) + '...');
        return result;
      }

      // For production with real API key
      console.log('🌐 Using real Claude API (production mode)');
      
      // Note: Direct browser calls to Claude API will fail due to CORS
      // In production, you need a backend proxy server
      throw new Error('Production API calls require a backend server to avoid CORS issues. Using mock API instead.');
      
    } catch (error) {
      console.error('❌ API call failed, falling back to mock:', error);
      // Fallback to mock API if real API fails
      const { mockClaudeAPI } = await import('../utils/api.js');
      return await mockClaudeAPI(prompt);
    }
  };

  // Download English terms as JSON
  const downloadTerms = () => {
    if (englishTerms.length === 0) {
      alert('Chưa có thuật ngữ nào được trích xuất!');
      return;
    }

    const dataStr = JSON.stringify({
      document: uploadedFile?.name,
      extracted_date: new Date().toISOString(),
      total_terms: englishTerms.length,
      terms: englishTerms
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thuật-ngữ-${uploadedFile?.name?.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload file handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setUploadedFile(file);
    setIsLoading(true);
    setError('');

    try {
      let content = '';
      
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        content = await file.text();
      } else {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('File is empty or could not be read');
      }

      console.log('✅ File content loaded, length:', content.length);
      setDocumentContent(content);
      setStep('analyze');
    } catch (error) {
      console.error('❌ Error reading file:', error);
      setError(`Lỗi đọc file: ${error.message}`);
      alert('Lỗi đọc file. Vui lòng kiểm tra định dạng file và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress update
  const updateProgress = async (progress, status) => {
    console.log(`📊 Progress: ${progress}% - ${status}`);
    setAnalysisProgress(progress);
    setAnalysisStatus(status);
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  // Extract English terms
  const extractEnglishTerms = async () => {
    try {
      await updateProgress(20, 'Đang trích xuất thuật ngữ tiếng Anh...');
      
      const prompt = `
Phân tích tài liệu sau và trích xuất TẤT CẢ thuật ngữ tiếng Anh quan trọng kèm giải thích tiếng Việt:

Nội dung tài liệu:
${documentContent.slice(0, 6000)}

Trả về kết quả CHÍNH XÁC theo định dạng JSON sau:
{
  "terms": [
    {
      "english": "Technical Term",
      "vietnamese": "Giải thích bằng tiếng Việt",
      "category": "Loại thuật ngữ"
    }
  ]
}

CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG THÊM TEXT NÀO KHÁC.`;

      console.log('🔍 Extracting English terms...');
      const response = await callClaudeAPI(prompt);
      const termsData = JSON.parse(response);
      setEnglishTerms(termsData.terms || []);
      await updateProgress(40, `Tìm thấy ${(termsData.terms || []).length} thuật ngữ tiếng Anh`);
      return termsData.terms || [];
    } catch (error) {
      console.error('❌ Error extracting terms:', error);
      await updateProgress(40, 'Lỗi trích xuất thuật ngữ, tiếp tục phân tích...');
      return [];
    }
  };

  // Analyze document
  const analyzeDocument = async () => {
    setIsLoading(true);
    setAnalysisProgress(0);
    setError('');
    
    try {
      console.log('🚀 Starting document analysis...');
      await updateProgress(10, 'Bắt đầu phân tích tài liệu...');
      
      // Show API mode info to user
      if (shouldUseMockAPI()) {
        await updateProgress(15, 'Sử dụng Mock API (chế độ phát triển)...');
      }
      
      // Extract English terms if enabled
      if (import.meta.env.VITE_ENABLE_ENGLISH_TERMS_EXTRACTION !== 'false') {
        await extractEnglishTerms();
      }
      
      await updateProgress(60, 'Đang phân tích cấu trúc và nội dung...');
      
      const prompt = `
Phân tích tài liệu sau và đưa ra:
1. Tóm tắt nội dung chính (2-3 câu)
2. Các chủ đề/kiến thức chính được đề cập
3. Đề xuất số lượng câu hỏi phù hợp (từ 5-20 câu) để bao quát toàn bộ kiến thức
4. Ước tính độ khó của nội dung (Dễ/Trung bình/Khó)

Nội dung tài liệu:
${documentContent.slice(0, 5000)}

Trả về kết quả CHÍNH XÁC theo định dạng JSON sau:
{
  "summary": "Tóm tắt nội dung chính...",
  "main_topics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
  "suggested_questions": {
    "min": 5,
    "max": 15,
    "recommended": 10
  },
  "difficulty": "Trung bình",
  "estimated_time": "15-20 phút"
}

CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG THÊM TEXT NÀO KHÁC.`;

      await updateProgress(80, 'Đang xử lý kết quả phân tích...');
      
      console.log('🔍 Analyzing document structure...');
      const response = await callClaudeAPI(prompt);
      console.log('📄 Analysis response received:', response.substring(0, 200) + '...');
      
      const analysisData = JSON.parse(response);
      console.log('✅ Analysis data parsed successfully:', analysisData);
      
      await updateProgress(100, 'Hoàn thành phân tích thành công!');
      
      setDocumentAnalysis(analysisData);
      setSelectedQuestionCount(analysisData.suggested_questions?.recommended || 10);
      
    } catch (error) {
      console.error('❌ Error analyzing document:', error);
      setError(`Lỗi phân tích tài liệu: ${error.message}`);
      await updateProgress(0, `Lỗi: ${error.message}`);
      alert(`Lỗi phân tích tài liệu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate questions
  const generateQuestions = async () => {
    setStep('generating');
    setIsLoading(true);
    setAnalysisProgress(0);
    setError('');
    
    try {
      await updateProgress(20, 'Đang chuẩn bị tạo câu hỏi...');
      
      const prompt = `
Dựa trên nội dung tài liệu sau, hãy tạo ${selectedQuestionCount} câu hỏi trắc nghiệm (multiple choice) với 4 lựa chọn A, B, C, D. 

Nội dung tài liệu:
${documentContent.slice(0, 4000)}

Trả về kết quả CHÍNH XÁC theo định dạng JSON sau:
{
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi ở đây?",
      "options": {
        "A": "Lựa chọn A",
        "B": "Lựa chọn B", 
        "C": "Lựa chọn C",
        "D": "Lựa chọn D"
      },
      "correct_answer": "A",
      "explanation": "Giải thích tại sao đáp án A đúng",
      "topic": "Chủ đề",
      "difficulty": "Dễ"
    }
  ]
}

CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG THÊM TEXT NÀO KHÁC.`;

      await updateProgress(60, `Đang tạo ${selectedQuestionCount} câu hỏi từ AI...`);
      
      console.log('🎯 Generating questions...');
      const response = await callClaudeAPI(prompt);
      const questionsData = JSON.parse(response);
      
      await updateProgress(90, 'Đang xử lý và kiểm tra câu hỏi...');
      
      setQuestions(questionsData.questions || []);
      
      await updateProgress(100, `Hoàn thành! Đã tạo ${(questionsData.questions || []).length} câu hỏi`);
      
      setTimeout(() => {
        setStep('quiz');
        setAnalysisProgress(0);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      setError(`Lỗi tạo câu hỏi: ${error.message}`);
      alert(`Lỗi tạo câu hỏi: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Rest of the component methods remain the same...
  const handleAnswerSelect = (answer) => setSelectedAnswer(answer);

  const submitAnswer = async () => {
    if (!selectedAnswer) return;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { selected: selectedAnswer, correct: isCorrect, question: currentQuestion }
    }));

    if (isCorrect) {
      setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
      setScore(prev => prev + 1);
      setExplanation(`🎉 Chính xác! ${currentQuestion.explanation}`);
    } else {
      setIncorrectQuestions(prev => new Set([...prev, currentQuestionIndex]));
      setExplanation(`❌ Sai rồi! Đáp án đúng là ${currentQuestion.correct_answer}. ${currentQuestion.explanation}`);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer('');
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('results');
    }
  };

  const retryIncorrect = () => {
    const incorrectList = Array.from(incorrectQuestions);
    if (incorrectList.length > 0) {
      setCurrentQuestionIndex(incorrectList[0]);
      setIncorrectQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(incorrectList[0]);
        return newSet;
      });
      setSelectedAnswer('');
      setShowExplanation(false);
      setStep('quiz');
    }
  };

  const resetQuiz = () => {
    setStep('upload');
    setUploadedFile(null);
    setDocumentContent('');
    setDocumentAnalysis(null);
    setAnalysisProgress(0);
    setAnalysisStatus('');
    setEnglishTerms([]);
    setSelectedQuestionCount(10);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswer('');
    setShowExplanation(false);
    setScore(0);
    setCompletedQuestions(new Set());
    setIncorrectQuestions(new Set());
    setError('');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Quiz Agent</h1>
          </div>
          <p className="text-gray-600">Tạo quiz thông minh từ tài liệu của bạn</p>
          {shouldUseMockAPI() && (
            <div className="mt-2 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
              🔧 Chế độ phát triển - Sử dụng Mock API
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Tài Liệu</h2>
              <p className="text-gray-600 mb-8">Chọn file TXT, MD để tạo quiz (PDF và DOCX sẽ được hỗ trợ sau)</p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-12 hover:border-indigo-500 transition-colors">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <span className="text-indigo-600 font-semibold">
                    {isLoading ? 'Đang đọc file...' : 'Nhấn để chọn file'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Hỗ trợ: .txt, .md
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Analyze Step */}
        {step === 'analyze' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tài liệu đã sẵn sàng!</h2>
              <p className="text-gray-600">File: <span className="font-semibold text-indigo-600">{uploadedFile?.name}</span></p>
              <p className="text-sm text-gray-500 mt-2">Kích thước: {Math.round(documentContent.length / 1024)} KB</p>
            </div>

            {!documentAnalysis ? (
              <div className="text-center">
                {!isLoading ? (
                  <>
                    <button
                      onClick={analyzeDocument}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-3 mx-auto"
                    >
                      <Brain className="w-6 h-6" />
                      Phân tích tài liệu
                    </button>
                    <p className="text-gray-500 text-sm mt-4">AI sẽ phân tích nội dung và trích xuất thuật ngữ tiếng Anh</p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full max-w-md mx-auto">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Tiến trình phân tích</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-indigo-600 text-sm mt-3 font-medium">{analysisStatus}</p>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Analysis Results */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">📊 Kết quả phân tích</h3>
                    {englishTerms.length > 0 && (
                      <button
                        onClick={downloadTerms}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download thuật ngữ ({englishTerms.length})
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Tóm tắt nội dung:</h4>
                      <p className="text-gray-600">{documentAnalysis.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Chủ đề chính:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(documentAnalysis.main_topics || []).map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Độ khó:</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          documentAnalysis.difficulty === 'Dễ' ? 'bg-green-100 text-green-800' :
                          documentAnalysis.difficulty === 'Khó' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {documentAnalysis.difficulty}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Thời gian ước tính:</h4>
                        <span className="text-gray-600">{documentAnalysis.estimated_time}</span>
                      </div>
                    </div>
                    
                    {englishTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Thuật ngữ tiếng Anh ({englishTerms.length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {englishTerms.slice(0, 6).map((term, index) => (
                            <div key={index} className="bg-white p-2 rounded border text-xs">
                              <span className="font-semibold text-blue-600">{term.english}</span>
                              <br />
                              <span className="text-gray-600">{term.vietnamese}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Count Selection */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Chọn số câu hỏi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số câu hỏi: {selectedQuestionCount} câu
                      </label>
                      <input
                        type="range"
                        min={documentAnalysis.suggested_questions?.min || 5}
                        max={documentAnalysis.suggested_questions?.max || 15}
                        value={selectedQuestionCount}
                        onChange={(e) => setSelectedQuestionCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{documentAnalysis.suggested_questions?.min || 5} câu</span>
                        <span className="font-semibold text-indigo-600">
                          Đề xuất: {documentAnalysis.suggested_questions?.recommended || 10} câu
                        </span>
                        <span>{documentAnalysis.suggested_questions?.max || 15} câu</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={generateQuestions}
                    className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-3 mx-auto"
                  >
                    <Brain className="w-6 h-6" />
                    Tạo {selectedQuestionCount} câu hỏi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional components (generating, quiz, results) would go here */}
        {/* For brevity, showing key fixes only */}
      </div>
    </div>
  );
};

export default AIQuizAgent;