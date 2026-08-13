const OpenAI = require('openai');

const HF_ROUTER_BASE_URL = 'https://router.huggingface.co/v1';
const DEEPSEEK_MODEL = 'deepseek-ai/DeepSeek-V3-0324:novita';

/**
 * Lazily initialize OpenAI client with Hugging Face router base URL
 */
function getClient() {
  const token = process.env.HF_TOKEN;
  if (!token || !token.trim()) {
    const error = new Error('HF_TOKEN is not configured in environment variables');
    error.statusCode = 500;
    throw error;
  }

  return new OpenAI({
    baseURL: HF_ROUTER_BASE_URL,
    apiKey: token.trim(),
  });
}

/**
 * Generate a response using DeepSeek-V3-0324 via Hugging Face Router
 * 
 * @param {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} messages - Array of chat messages
 * @param {Object} [options] - Optional configurations (temperature, max_tokens, etc.)
 * @returns {Promise<string>} Generated assistant response text
 */
async function generateFounderResponse(messages, options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    const error = new Error('Messages array is required and must not be empty');
    error.statusCode = 400;
    throw error;
  }

  // Validate message structure
  const formattedMessages = messages
    .filter((m) => m && m.content && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'model' ? 'assistant' : m.role || 'user',
      content: m.content.trim(),
    }));

  if (formattedMessages.length === 0) {
    const error = new Error('Valid message content is required');
    error.statusCode = 400;
    throw error;
  }

  const client = getClient();
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;
  const maxTokens = typeof options.max_tokens === 'number' ? options.max_tokens : 1500;
  const model = options.model || DEEPSEEK_MODEL;

  try {
    console.log(`[DeepSeek-V3] Sending request to ${HF_ROUTER_BASE_URL} (Model: ${model}, Messages: ${formattedMessages.length})`);
    
    const completion = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const assistantContent = completion?.choices?.[0]?.message?.content;

    if (!assistantContent || !assistantContent.trim()) {
      throw new Error('Received empty response from DeepSeek API');
    }

    console.log(`[DeepSeek-V3] Successfully received response (${assistantContent.length} chars)`);
    return assistantContent.trim();
  } catch (error) {
    // Sanitized server logging without exposing tokens
    console.error('[DeepSeek-V3 Error]', {
      status: error.status || error.statusCode || 500,
      message: error.message,
      code: error.code || 'DEEPSEEK_API_ERROR',
      type: error.type,
    });

    // Rethrow sanitized error
    const sanitizedError = new Error(
      error.status === 401
        ? 'Hugging Face authentication failed. Please check HF_TOKEN.'
        : `DeepSeek AI generation failed: ${error.message || 'Unknown error'}`
    );
    sanitizedError.statusCode = error.status || error.statusCode || 500;
    throw sanitizedError;
  }
}

module.exports = {
  generateFounderResponse,
  DEEPSEEK_MODEL,
  HF_ROUTER_BASE_URL,
};
