const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateScope, getScopeHistory } = require('../controllers/mvpController');

const router = express.Router();

router.use(protect);

router.post('/generate', generateScope);
router.post('/', generateScope);
router.get('/history', getScopeHistory);
router.get('/history/:ventureId', getScopeHistory);
router.get('/:ventureId', getScopeHistory);
router.get('/', getScopeHistory);

module.exports = router;
