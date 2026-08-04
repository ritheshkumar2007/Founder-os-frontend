const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeTraction, getTractionHistory } = require('../controllers/tractionController');

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeTraction);
router.post('/generate', analyzeTraction);
router.post('/', analyzeTraction);
router.get('/history', getTractionHistory);
router.get('/history/:ventureId', getTractionHistory);
router.get('/:ventureId', getTractionHistory);
router.get('/', getTractionHistory);

module.exports = router;
