const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateUpdate, getUpdateHistory } = require('../controllers/investorUpdateController');

const router = express.Router();

router.use(protect);

router.post('/generate', generateUpdate);
router.post('/', generateUpdate);
router.get('/history', getUpdateHistory);
router.get('/history/:ventureId', getUpdateHistory);
router.get('/:ventureId', getUpdateHistory);
router.get('/', getUpdateHistory);

module.exports = router;
