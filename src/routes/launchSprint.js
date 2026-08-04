const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getLaunchSprint,
  saveLaunchSprint,
  addTask,
  updateTask,
  deleteTask,
} = require('../controllers/launchSprintController');

const router = express.Router({ mergeParams: true });

const addTaskValidation = [
  body('text').trim().notEmpty().withMessage('Task text is required'),
  body('day')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Day must be an integer between 1 and 7'),
];

const updateTaskValidation = [
  body('text').optional().trim().notEmpty().withMessage('Task text cannot be empty'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getLaunchSprint)
  .post(saveLaunchSprint)
  .put(saveLaunchSprint);

router.post('/tasks', addTaskValidation, addTask);
router.put('/tasks/:taskId', updateTaskValidation, updateTask);
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
