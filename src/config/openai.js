/**
 * OpenAI API configuration
 */

module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_API_MODEL || 'gpt-image-1',
  
  // Model for analyzing prompts and optimizing parameters
  promptAnalysisModel: process.env.OPENAI_PROMPT_ANALYSIS_MODEL || 'gpt-4.1-nano',
  
  // Default parameters for image generation
  defaults: {
    n: 1,
    size: '1024x1024',
    quality: 'auto',
    background: 'auto',
    output_format: 'png'
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000
  }
};