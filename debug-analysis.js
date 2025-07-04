// Debug script to test document analysis
import { mockClaudeAPI } from './src/utils/api.js';

const testPrompt = `
Phân tích tài liệu sau và đưa ra:
1. Tóm tắt nội dung chính (2-3 câu)
2. Các chủ đề/kiến thức chính được đề cập
3. Đề xuất số lượng câu hỏi phù hợp (từ 5-20 câu) để bao quát toàn bộ kiến thức
4. Ước tính độ khó của nội dung (Dễ/Trung bình/Khó)

Nội dung tài liệu:
Machine Learning là một lĩnh vực của trí tuệ nhân tạo (AI) cho phép máy tính học từ dữ liệu.

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

async function testAnalysis() {
  try {
    console.log('Testing document analysis...');
    const result = await mockClaudeAPI(testPrompt);
    console.log('Result:', result);
    const parsed = JSON.parse(result);
    console.log('Parsed successfully:', parsed);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

testAnalysis();