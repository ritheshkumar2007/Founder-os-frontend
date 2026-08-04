const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  createVenture,
  getVentures,
  getVentureById,
  updateVenture,
  deleteVenture,
} = require('../controllers/ventureController');
const {
  saveVentureBrief,
  getVentureBrief,
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
  analyzeInterviews,
  getFounderNotes,
  saveFounderNotes,
  getProgress,
} = require('../controllers/ideaValidationController');

const router = express.Router();

// Apply auth middleware to all venture routes
router.use(protect);

// ====================================================
// VENTURE MANAGEMENT ROUTES
// ====================================================

// Validation for venture creation
const ventureValidation = [
  body('ventureName').trim().notEmpty().withMessage('Venture name is required'),
];

router.route('/')
  .post(ventureValidation, createVenture)
  .get(getVentures);

router.route('/:ventureId')
  .all(checkVentureOwnership)
  .get(getVentureById)
  .put(updateVenture)
  .delete(deleteVenture);

// ====================================================
// IDEA VALIDATION - VENTURE BRIEF ROUTES
// ====================================================

router.route('/:ventureId/idea-validation/venture-brief')
  .all(checkVentureOwnership)
  .get(getVentureBrief)
  .post(saveVentureBrief)
  .put(saveVentureBrief);

// ====================================================
// IDEA VALIDATION - CUSTOMER VALIDATION (INTERVIEWS) ROUTES
// ====================================================

const interviewValidation = [
  body('personName').trim().notEmpty().withMessage('Person name is required'),
  body('painLevel')
    .notEmpty()
    .withMessage('Pain level is required')
    .toUpperCase()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Pain level must be LOW, MEDIUM, or HIGH'),
  body('wouldPay')
    .notEmpty()
    .withMessage('Would pay choice is required')
    .toUpperCase()
    .isIn(['YES', 'MAYBE', 'NO'])
    .withMessage('Would pay must be YES, MAYBE, or NO'),
];

const updateInterviewValidation = [
  body('painLevel')
    .optional()
    .toUpperCase()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Pain level must be LOW, MEDIUM, or HIGH'),
  body('wouldPay')
    .optional()
    .toUpperCase()
    .isIn(['YES', 'MAYBE', 'NO'])
    .withMessage('Would pay must be YES, MAYBE, or NO'),
];

router.route('/:ventureId/interviews')
  .all(checkVentureOwnership)
  .get(getInterviews)
  .post(interviewValidation, createInterview);

router.route('/:ventureId/interviews/:interviewId')
  .all(checkVentureOwnership)
  .put(updateInterviewValidation, updateInterview)
  .delete(deleteInterview);

// ====================================================
// IDEA VALIDATION - ANALYZE INSIGHTS ROUTE
// ====================================================

router.post('/:ventureId/analyze', checkVentureOwnership, analyzeInterviews);

// ====================================================
// IDEA VALIDATION - FOUNDER NOTES ROUTES
// ====================================================

router.route('/:ventureId/founder-notes')
  .all(checkVentureOwnership)
  .get(getFounderNotes)
  .put(saveFounderNotes);

// ====================================================
// IDEA VALIDATION - PROGRESS ROUTE
// ====================================================

router.get('/:ventureId/progress', checkVentureOwnership, getProgress);

// Import sub-routers
const mvpScopeRouter = require('./mvpScope');
const roadmapRouter = require('./roadmap');
const marketingRouter = require('./marketing');
const launchSprintRouter = require('./launchSprint');
const tractionRouter = require('./traction');
const investorUpdateRouter = require('./investorUpdate');

// ====================================================
// SUB-ROUTERS (MVP SCOPE, ROADMAP, MARKETING PLAN, LAUNCH SPRINT, TRACTION, INVESTOR UPDATE)
// ====================================================

router.use('/:ventureId/mvp-scope', mvpScopeRouter);
router.use('/:ventureId/roadmap', roadmapRouter);
router.use('/:ventureId/marketing-plan', marketingRouter);
router.use('/:ventureId/launch-sprint', launchSprintRouter);
router.use('/:ventureId/traction', tractionRouter);
router.use('/:ventureId/investor-update', investorUpdateRouter);

module.exports = router;
