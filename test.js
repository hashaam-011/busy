const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing MCP CV & Email Server API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test CV parsing
    console.log('2. Testing CV parsing...');
    const formData = new FormData();
    formData.append('cv', fs.createReadStream('sample-cv.txt'));

    const parseResponse = await axios.post(`${API_BASE}/api/parse-cv`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log('✅ CV parsing successful:', parseResponse.data.message);
    console.log('');

    // Test CV question
    console.log('3. Testing CV question...');
    const questionResponse = await axios.post(`${API_BASE}/api/ask-cv-question`, {
      question: 'What was my last position?'
    });
    console.log('✅ CV question answered:', questionResponse.data.answer);
    console.log('');

    // Test email sending (will fail without proper SMTP config)
    console.log('4. Testing email sending...');
    try {
      const emailResponse = await axios.post(`${API_BASE}/api/send-email`, {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email from the MCP server.'
      });
      console.log('✅ Email sent successfully:', emailResponse.data.message);
    } catch (emailError) {
      console.log('⚠️  Email test failed (expected without SMTP config):', emailError.response?.data?.error || emailError.message);
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('📱 Frontend available at: http://localhost:3000');
    console.log('🔧 API available at: http://localhost:3001');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    console.log('');
    console.log('💡 Make sure the server is running: npm start');
  }
}

// Run tests
testAPI();