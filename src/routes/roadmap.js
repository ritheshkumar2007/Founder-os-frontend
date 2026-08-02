const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { checkVentureOwnership } = require('../middleware/ventureMiddleware');
const {
  getRoadmap,
  saveRoadmap,
} = require('../controllers/roadmapController');

const router = express.Router({ mergeParams: true });

const roadmapValidation = [
  body('currentMilestone').optional().isString().withMessage('currentMilestone must be a string'),
  body('milestones').optional().isArray().withMessage('milestones must be an array'),
];

router.use(protect);
router.use(checkVentureOwnership);

router.route('/')
  .get(getRoadmap)
  .post(roadmapValidation, saveRoadmap)
  .put(roadmapValidation, saveRoadmap);

module.exports = router;
