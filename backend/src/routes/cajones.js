const express = require('express');
const parkingService = require('../services/parkingService');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cajones = await parkingService.getAllCajones();
    res.json(cajones);
  } catch (err) {
    next(err);
  }
});

router.get('/overview', requireAdmin, async (req, res, next) => {
  try {
    const overview = await parkingService.getParkingOverview();
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
