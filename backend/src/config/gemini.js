const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = 'gemini-1.5-flash';
const generationConfig = {
  temperature: 0.2,
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 4096,
};

function getGeminiClient() {
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

function getGeminiModel() {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }
  return client.getGenerativeModel({ model: modelName, generationConfig });
}

module.exports = {
  apiKey,
  modelName,
  generationConfig,
  getGeminiClient,
  getGeminiModel,
};
