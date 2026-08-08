const { evaluateIdeaScore } = require('../services/aiService');

/**
 * @desc    Calculate or re-evaluate 100-point Idea Viability Score (IV-Score)
 * @route   POST /api/ventures/:ventureId/score
 * @access  Private (Owner only)
 */
const calculateIdeaScore = async (req, res, next) => {
  try {
    const scoreResult = await evaluateIdeaScore({ venture: req.venture });

    if (!req.venture.ideaValidation) {
      req.venture.ideaValidation = {};
    }

    req.venture.ideaValidation.ideaScore = scoreResult;
    await req.venture.save();

    res.status(200).json({
      success: true,
      ideaScore: req.venture.ideaValidation.ideaScore,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest Idea Viability Score for a venture
 * @route   GET /api/ventures/:ventureId/score
 * @access  Private (Owner only)
 */
const getIdeaScore = async (req, res, next) => {
  try {
    let ideaScore = req.venture.ideaValidation?.ideaScore;

    // If no score computed yet or unrated, compute initial baseline
    if (!ideaScore || !ideaScore.lastCalculatedAt || ideaScore.overallScore === 0) {
      ideaScore = await evaluateIdeaScore({ venture: req.venture });
      req.venture.ideaValidation.ideaScore = ideaScore;
      await req.venture.save();
    }

    res.status(200).json({
      success: true,
      ideaScore,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateIdeaScore,
  getIdeaScore,
};
