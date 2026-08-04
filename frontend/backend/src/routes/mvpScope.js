const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getMvpScope,
  saveMvpScope,
} = require('../controllers/mvpScopeController');

const router = express.Router({ mergeParams: true });

// Validation rules for saving/updating MVP scope
const mvpScopeValidation = [
  body('coreCustomerProblem')
    .optional()
    .isString()
    .withMessage('coreCustomerProblem must be a string'),
  body('mainCustomerJob')
    .optional()
    .isString()
    .withMessage('mainCustomerJob must be a string'),
  body('mvpPromise')
    .optional()
    .isString()
    .withMessage('mvpPromise must be a string'),
  body('desiredOutcome')
    .optional()
    .isString()
    .withMessage('desiredOutcome must be a string'),
  body('mustHaveFeatures')
    .optional()
    .isArray()
    .withMessage('mustHaveFeatures must be an array of strings'),
  body('excludedFeatures')
    .optional()
    .isArray()
    .withMessage('excludedFeatures must be an array of strings'),
  body('buildTarget')
    .optional()
    .isString()
    .withMessage('buildTarget must be a string'),
  body('buildNow')
    .optional()
    .isArray()
    .withMessage('buildNow must be an array of strings'),
  body('buildLater')
    .optional()
    .isArray()
    .withMessage('buildLater must be an array of strings'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getMvpScope)
  .post(mvpScopeValidation, saveMvpScope)
  .put(mvpScopeValidation, saveMvpScope);

module.exports = router;
