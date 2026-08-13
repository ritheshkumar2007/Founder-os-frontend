const express = require('express');
const { generateFounderResponse } = require('../services/deepseekService');

const router = express.Router();

// @route   POST /api/test-ai
// @desc    Temporary test endpoint for DeepSeek-V3 on Hugging Face Router
// @access  Public (for connectivity testing)
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are FounderOS, an AI startup coach. Give practical, concise and actionable startup advice.',
      },
      {
        role: 'user',
        content: message.trim(),
      },
    ];

    const response = await generateFounderResponse(messages);

    return res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Test AI Endpoint Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'DeepSeek AI request failed',
    });
  }
});

module.exports = router;
