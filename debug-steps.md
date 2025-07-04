# Debug Steps for AI Quiz Agent

## Common Issues After File Upload

### 1. Check Browser Console
Open browser dev tools (F12) and look for:
- ❌ JavaScript errors
- 🔍 Console logs from the analysis process
- 🌐 Network requests (if using real API)

### 2. Check File Upload
- ✅ File is being read correctly
- ✅ Document content is not empty
- ✅ Step changes from 'upload' to 'analyze'

### 3. Check API Calls
- 🔍 Mock API is being called (should see console logs)
- 📝 API responses are valid JSON
- ⚠️ No parsing errors

### 4. Quick Test Commands
Add these to browser console to test:

```javascript
// Test mock API directly
import('/src/utils/api.js').then(api => {
  api.mockClaudeAPI('Phân tích tài liệu test').then(console.log);
});

// Check current state
console.log('Current step:', document.querySelector('[data-step]')?.dataset?.step);
```

### 5. Add Debug Logging
Replace the current component with the fixed version that includes:
- ✅ Console logging at each step
- ✅ Better error handling
- ✅ Progress indicators
- ✅ Error display in UI

### 6. Common Fixes
1. **Clear browser cache**: Ctrl+Shift+R
2. **Check file size**: Large files might timeout
3. **Try different file**: Use a simple .txt file first
4. **Check environment**: Make sure .env variables are loaded

### 7. Test with Simple Content
Create a test file with just:
```
Machine Learning là gì?
AI (Artificial Intelligence) là trí tuệ nhân tạo.
```

This should trigger the mock API and work immediately.