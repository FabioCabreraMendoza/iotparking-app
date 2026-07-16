const express = require('express');
const { query } = require('../config/db');
const parkingService = require('../services/parkingService');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Registro publico disparado desde el modal de "tarjeta detectada" en la web.
router.post('/', async (req, res, next) => {
  try {
    const { uid, nombre, placa } = req.body;
    if (!uid || !nombre || !placa) {
      return res.status(400).json({ error: 'uid, nombre y placa son requeridos' });
    }

    const existente = await parkingService.findUsuarioByUid(uid);
    if (existente) {
      return res.status(409).json({ error: 'Esa tarjeta ya esta registrada' });
    }

    const resultado = await parkingService.registrarUsuarioDesdeTarjeta({ uid, nombre, placa });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { placa } = req.query;
    const { rows } = placa
      ? await query('SELECT * FROM usuarios WHERE placa_auto ILIKE $1 ORDER BY fecha_registro DESC', [
          `%${placa}%`,
        ])
      : await query('SELECT * FROM usuarios ORDER BY fecha_registro DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
