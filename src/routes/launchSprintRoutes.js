const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateSprint, getSprintHistory } = require('../controllers/launchSprintController');

const router = express.Router();

router.use(protect);

router.post('/generate', generateSprint);
router.post('/', generateSprint);
router.get('/history', getSprintHistory);
router.get('/history/:ventureId', getSprintHistory);
router.get('/:ventureId', getSprintHistory);
router.get('/', getSprintHistory);

module.exports = router;
