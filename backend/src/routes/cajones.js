const express = require('express');
const parkingService = require('../services/parkingService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cajones = await parkingService.getAllCajones();
    res.json(cajones);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
