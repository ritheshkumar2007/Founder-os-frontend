const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getInvestorUpdate,
  createInvestorUpdate,
  updateInvestorUpdate,
  getInvestorUpdateText,
  getInvestorUpdateSummary,
} = require('../controllers/investorUpdateController');

const router = express.Router({ mergeParams: true });

const updateValidation = [
  body('companyName').optional().isString().withMessage('companyName must be a string'),
  body('problem').optional().isString().withMessage('problem must be a string'),
  body('solution').optional().isString().withMessage('solution must be a string'),
  body('targetCustomer').optional().isString().withMessage('targetCustomer must be a string'),
  body('validationEvidence').optional().isString().withMessage('validationEvidence must be a string'),
  body('mvpProgress').optional().isString().withMessage('mvpProgress must be a string'),
  body('marketingProgress').optional().isString().withMessage('marketingProgress must be a string'),
  body('launchProgress').optional().isString().withMessage('launchProgress must be a string'),
  body('tractionSummary').optional().isString().withMessage('tractionSummary must be a string'),
  body('keyLearnings').optional().isString().withMessage('keyLearnings must be a string'),
  body('nextMilestone').optional().isString().withMessage('nextMilestone must be a string'),
  body('fundingNeeded').optional().isString().withMessage('fundingNeeded must be a string'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getInvestorUpdate)
  .post(createInvestorUpdate)
  .put(updateValidation, updateInvestorUpdate);

router.get('/text', getInvestorUpdateText);
router.get('/summary', getInvestorUpdateSummary);

module.exports = router;
