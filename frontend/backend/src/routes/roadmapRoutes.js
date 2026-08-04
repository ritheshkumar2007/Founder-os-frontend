const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateRoadmap, getRoadmapHistory } = require('../controllers/roadmapController');

const router = express.Router();

router.use(protect);

router.post('/generate', generateRoadmap);
router.post('/', generateRoadmap);
router.get('/history', getRoadmapHistory);
router.get('/history/:ventureId', getRoadmapHistory);
router.get('/:ventureId', getRoadmapHistory);
router.get('/', getRoadmapHistory);

module.exports = router;
