const { validationResult } = require('express-validator');
const Venture = require('../models/Venture');

/**
 * @desc    Create new venture for authenticated user
 * @route   POST /api/ventures
 * @access  Private
 */
const createVenture = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { ventureName } = req.body;

    const venture = await Venture.create({
      owner: req.user.id,
      ventureName,
      ideaValidation: {
        ventureBrief: {},
        customerValidation: { interviews: [] },
        validationInsights: { decision: 'Keep Validating' },
        founderNotes: { text: '' },
        progress: {
          currentStep: 'Venture Brief',
          unlockedStep: 'Venture Brief',
          completedSteps: [],
        },
      },
    });

    res.status(201).json({
      success: true,
      venture,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all ventures owned by logged-in user
 * @route   GET /api/ventures
 * @access  Private
 */
const getVentures = async (req, res, next) => {
  try {
    const ventures = await Venture.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: ventures.length,
      ventures,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single venture by ID
 * @route   GET /api/ventures/:ventureId
 * @access  Private (Owner only)
 */
const getVentureById = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      venture: req.venture,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update venture
 * @route   PUT /api/ventures/:ventureId
 * @access  Private (Owner only)
 */
const updateVenture = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { ventureName } = req.body;

    if (ventureName) {
      req.venture.ventureName = ventureName;
    }

    await req.venture.save();

    res.status(200).json({
      success: true,
      venture: req.venture,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete venture
 * @route   DELETE /api/ventures/:ventureId
 * @access  Private (Owner only)
 */
const deleteVenture = async (req, res, next) => {
  try {
    await Venture.findByIdAndDelete(req.venture._id);

    res.status(200).json({
      success: true,
      message: 'Venture deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVenture,
  getVentures,
  getVentureById,
  updateVenture,
  deleteVenture,
};
