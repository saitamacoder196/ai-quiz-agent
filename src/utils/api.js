// API configuration and helper functions
const API_CONFIG = {
  baseURL: import.meta.env.VITE_CLAUDE_API_URL || '/api/claude',
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000
};

// Mock Claude API for development
export const mockClaudeAPI = async (prompt) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Parse the prompt to determine response type
  if (prompt.includes('trích xuất') && prompt.includes('thuật ngữ tiếng Anh')) {
    return JSON.stringify({
      terms: [
        { english: "Machine Learning", vietnamese: "Học máy", category: "AI" },
        { english: "Neural Network", vietnamese: "Mạng nơ-ron", category: "AI" },
        { english: "API", vietnamese: "Giao diện lập trình ứng dụng", category: "Technical" },
        { english: "Database", vietnamese: "Cơ sở dữ liệu", category: "Technical" },
        { english: "Algorithm", vietnamese: "Thuật toán", category: "Computer Science" }
      ]
    });
  }
  
  if (prompt.includes('Phân tích tài liệu')) {
    return JSON.stringify({
      summary: "Tài liệu này trình bày về các khái niệm cơ bản trong lập trình và khoa học máy tính.",
      main_topics: ["Lập trình", "Thuật toán", "Cấu trúc dữ liệu"],
      suggested_questions: {
        min: 5,
        max: 15,
        recommended: 10
      },
      difficulty: "Trung bình",
      estimated_time: "15-20 phút"
    });
  }
  
  if (prompt.includes('câu hỏi trắc nghiệm')) {
    return JSON.stringify({
      questions: [
        {
          id: 1,
          question: "Machine Learning là gì?",
          options: {
            "A": "Một ngôn ngữ lập trình",
            "B": "Một phương pháp để máy tính học từ dữ liệu",
            "C": "Một loại phần cứng máy tính",
            "D": "Một hệ điều hành"
          },
          correct_answer: "B",
          explanation: "Machine Learning (Học máy) là phương pháp cho phép máy tính học từ dữ liệu mà không cần lập trình cụ thể.",
          topic: "AI",
          difficulty: "Dễ"
        },
        {
          id: 2,
          question: "API viết tắt của từ gì?",
          options: {
            "A": "Application Programming Interface",
            "B": "Advanced Programming Intelligence",
            "C": "Automated Process Integration",
            "D": "Application Process Indicator"
          },
          correct_answer: "A",
          explanation: "API là viết tắt của Application Programming Interface - Giao diện lập trình ứng dụng.",
          topic: "Technical",
          difficulty: "Dễ"
        }
      ]
    });
  }
  
  return JSON.stringify({ response: "Mock response" });
};

// Export for use in components
export default API_CONFIG;