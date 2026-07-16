const express = require('express');
const env = require('../config/env');
const parkingService = require('../services/parkingService');

const router = express.Router();

router.get('/status', async (req, res, next) => {
  try {
    const activas = await parkingService.countReservasActivas();
    res.json({
      activas,
      max: env.maxReservasActivas,
      bloqueado: activas >= env.maxReservasActivas,
      duracionMinutos: env.reservationDurationMinutes,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { cajonNumero, usuarioId } = req.body;
    if (!cajonNumero) {
      return res.status(400).json({ error: 'cajonNumero es requerido' });
    }
    const reserva = await parkingService.crearReserva({ cajonNumero, usuarioId });
    res.status(201).json(reserva);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
