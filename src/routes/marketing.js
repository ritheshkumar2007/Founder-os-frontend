const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getMarketingPlan,
  saveMarketingPlan,
} = require('../controllers/marketingController');

const router = express.Router({ mergeParams: true });

const marketingValidation = [
  body('idealCustomerProfile')
    .optional()
    .isString()
    .withMessage('idealCustomerProfile must be a string'),
  body('positioningStatement')
    .optional()
    .isString()
    .withMessage('positioningStatement must be a string'),
  body('marketingMessage')
    .optional()
    .isString()
    .withMessage('marketingMessage must be a string'),
  body('landingPageHeadline')
    .optional()
    .isString()
    .withMessage('landingPageHeadline must be a string'),
  body('callToAction')
    .optional()
    .isString()
    .withMessage('callToAction must be a string'),
  body('launchChannels')
    .optional()
    .isArray()
    .withMessage('launchChannels must be an array of strings'),
  body('directOutreachMessage')
    .optional()
    .isString()
    .withMessage('directOutreachMessage must be a string'),
  body('communityPostTemplate')
    .optional()
    .isString()
    .withMessage('communityPostTemplate must be a string'),
  body('referralIdea')
    .optional()
    .isString()
    .withMessage('referralIdea must be a string'),
  body('contentIdeas')
    .optional()
    .isArray()
    .withMessage('contentIdeas must be an array of strings'),
  body('first100UsersStrategy')
    .optional()
    .isString()
    .withMessage('first100UsersStrategy must be a string'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getMarketingPlan)
  .post(marketingValidation, saveMarketingPlan)
  .put(marketingValidation, saveMarketingPlan);

module.exports = router;
