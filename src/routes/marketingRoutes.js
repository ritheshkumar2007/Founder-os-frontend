const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generatePlan, getPlanHistory } = require('../controllers/marketingController');

const router = express.Router();

router.use(protect);

router.post('/generate', generatePlan);
router.post('/', generatePlan);
router.get('/history', getPlanHistory);
router.get('/history/:ventureId', getPlanHistory);
router.get('/:ventureId', getPlanHistory);
router.get('/', getPlanHistory);

module.exports = router;
