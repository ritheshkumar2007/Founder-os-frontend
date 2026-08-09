const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeVenture, getIntelligence } = require('../controllers/intelligenceController');

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeVenture);
router.post('/generate', analyzeVenture);
router.post('/', analyzeVenture);
router.get('/history', getIntelligence);
router.get('/history/:ventureId', getIntelligence);
router.get('/:ventureId', getIntelligence);
router.get('/', getIntelligence);

module.exports = router;
