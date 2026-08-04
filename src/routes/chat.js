const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const {
  sendMessage,
  getConversation,
  deleteConversation,
} = require('../controllers/chatController');

const router = express.Router();

const sendMessageValidation = [
  body('ventureId')
    .notEmpty()
    .withMessage('ventureId is required')
    .isMongoId()
    .withMessage('Invalid ventureId format'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('message is required'),
  body('workspace')
    .optional()
    .isString()
    .withMessage('workspace must be a string'),
];

router.use(protect);

router.post('/message', chatLimiter, sendMessageValidation, checkVentureOwnership, sendMessage);

router.route('/:ventureId')
  .all(checkVentureOwnership)
  .get(getConversation)
  .delete(deleteConversation);

module.exports = router;
