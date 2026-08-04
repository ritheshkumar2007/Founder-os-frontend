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

// ====================================================
// SINGLE VENTURE MANAGEMENT ROUTE (MUST BE AFTER SUB-ROUTERS)
// ====================================================

router.route('/:ventureId')
  .all(checkVentureOwnership)
  .get(getVentureById)
  .put(updateVenture)
  .delete(deleteVenture);

module.exports = router;
