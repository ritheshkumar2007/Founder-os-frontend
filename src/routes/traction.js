const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getTraction,
  saveTraction,
  getTractionHistory,
} = require('../controllers/tractionController');

const router = express.Router({ mergeParams: true });

const tractionValidation = [
  body('peopleContacted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('peopleContacted must be a non-negative integer'),
  body('customerInterviews')
    .optional()
    .isInt({ min: 0 })
    .withMessage('customerInterviews must be a non-negative integer'),
  body('waitlistSignups')
    .optional()
    .isInt({ min: 0 })
    .withMessage('waitlistSignups must be a non-negative integer'),
  body('mvpUsers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('mvpUsers must be a non-negative integer'),
  body('activeUsers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('activeUsers must be a non-negative integer'),
  body('payingUsers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('payingUsers must be a non-negative integer'),
  body('monthlyRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('monthlyRevenue must be a non-negative number'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getTraction)
  .post(tractionValidation, saveTraction)
  .put(tractionValidation, saveTraction);

router.get('/history', getTractionHistory);

module.exports = router;
