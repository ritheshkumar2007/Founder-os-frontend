const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const { getLaunchSprintForVenture, generateLaunchSprint, updateLaunchSprint } = require('../services/launchService');

const router = express.Router();
router.use(protect);

router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    let venture = await Venture.findOne({ _id: ventureId, owner: userId });
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    if (!venture) return res.status(404).json({ success: false, message: 'Venture not found' });

    const launchSprint = await getLaunchSprintForVenture(venture._id, userId, venture);
    return res.status(200).json({ success: true, launchSprint });
  } catch (error) {
    next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { ventureId } = req.body;
    const userId = req.user.id;
    let venture = ventureId ? await Venture.findOne({ _id: ventureId, owner: userId }) : null;
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    if (!venture) return res.status(404).json({ success: false, message: 'Venture not found' });

    const launchSprint = await generateLaunchSprint({ venture, userId });
    return res.status(200).json({ success: true, message: 'Launch sprint generated', launchSprint });
  } catch (error) {
    next(error);
  }
});

router.put('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const launchSprint = await updateLaunchSprint(ventureId, userId, req.body);
    return res.status(200).json({ success: true, launchSprint });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
