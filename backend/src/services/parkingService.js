const { query } = require('../config/db');
const env = require('../config/env');
const socketService = require('./socketService');
const { getSystemTime } = require('./systemTimeService');

const COLOR_BY_ESTADO = {
  disponible: 'verde',
  ocupado: 'rojo',
  reservado: 'azul',
};

async function getAllCajones() {
  const { rows } = await query('SELECT * FROM cajones ORDER BY numero');
  return rows;
}

async function countByEstado(estado) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM cajones WHERE estado = $1', [estado]);
  return rows[0].total;
}

async function broadcastEstadoActual() {
  const cajones = await getAllCajones();
  socketService.broadcastCajones(cajones);
  socketService.broadcastLedState(cajones.map((c) => COLOR_BY_ESTADO[c.estado]));
  return cajones;
}

async function setCajonEstado(numero, estado) {
  await query(
    'UPDATE cajones SET estado = $2, fecha_actualizacion = now() WHERE numero = $1',
    [numero, estado]
  );
}

async function logHistorial({ placaAuto, rfidUid, evento }) {
  const { rows } = await query(
    `INSERT INTO historial_accesos (placa_auto, rfid_uid, evento, "timestamp")
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [placaAuto || null, rfidUid || null, evento, getSystemTime()]
  );
  socketService.broadcastHistorial(rows[0]);
  return rows[0];
}

// ---- Reservas ----

async function countReservasActivas() {
  const { rows } = await query("SELECT COUNT(*)::int AS total FROM reservas WHERE estado = 'activa'");
  return rows[0].total;
}

async function crearReserva({ cajonNumero, usuarioId }) {
  const { rows: cajonRows } = await query('SELECT * FROM cajones WHERE numero = $1', [cajonNumero]);
  const cajon = cajonRows[0];
  if (!cajon) {
    const err = new Error('El cajon indicado no existe');
    err.status = 404;
    throw err;
  }
  if (cajon.estado !== 'disponible') {
    const err = new Error('El cajon no esta disponible para reservar');
    err.status = 409;
    throw err;
  }

  const activas = await countReservasActivas();
  if (activas >= env.maxReservasActivas) {
    const err = new Error('Limite de reservas activas alcanzado (50% de los cajones)');
    err.status = 409;
    throw err;
  }

  const inicio = getSystemTime();
  const fin = new Date(inicio.getTime() + env.reservationDurationMinutes * 60 * 1000);

  const { rows } = await query(
    `INSERT INTO reservas (cajon_id, usuario_id, fecha_inicio, fecha_fin, estado)
     VALUES ($1, $2, $3, $4, 'activa') RETURNING *`,
    [cajon.id, usuarioId || null, inicio, fin]
  );

  await setCajonEstado(cajonNumero, 'reservado');
  await broadcastEstadoActual();

  return rows[0];
}

// ---- Sensores IR ----
// lecturas: array de 10 booleanos, indice 0 = cajon 1 ... indice 9 = cajon 10.
// true = sensor en LOW = carro presente (logica inversa del sensor IR).
async function procesarLecturasIR(lecturas) {
  const cajones = await getAllCajones();

  for (const cajon of cajones) {
    const ocupadoFisicamente = Boolean(lecturas[cajon.numero - 1]);

    if (ocupadoFisicamente) {
      if (cajon.estado === 'disponible') {
        await setCajonEstado(cajon.numero, 'ocupado');
      } else if (cajon.estado === 'reservado') {
        await query(
          "UPDATE reservas SET estado = 'completada' WHERE cajon_id = $1 AND estado = 'activa'",
          [cajon.id]
        );
        await setCajonEstado(cajon.numero, 'ocupado');
      }
    } else if (cajon.estado === 'ocupado') {
      await setCajonEstado(cajon.numero, 'disponible');
    }
  }

  await broadcastEstadoActual();
}

// ---- RFID entrada / salida ----

async function findUsuarioByUid(rfidUid) {
  const { rows } = await query('SELECT * FROM usuarios WHERE rfid_uid = $1', [rfidUid]);
  return rows[0] || null;
}

async function intentarAbrirEntrada(usuario) {
  const ocupados = await countByEstado('ocupado');
  if (ocupados >= env.totalCajones) {
    socketService.sendLcdMessage('Estacionamiento Lleno');
    return { status: 'rejected_full' };
  }

  socketService.sendOpenBarrier();
  socketService.sendLcdMessage(`Bienvenido ${usuario.nombre}`);
  await logHistorial({ placaAuto: usuario.placa_auto, rfidUid: usuario.rfid_uid, evento: 'ENTRADA' });
  return { status: 'granted' };
}

async function handleRfidEntry(uid) {
  const usuario = await findUsuarioByUid(uid);
  if (!usuario) {
    socketService.sendLcdMessage('Registrarse en Web');
    socketService.broadcastNewCard(uid);
    return { status: 'unregistered' };
  }
  return intentarAbrirEntrada(usuario);
}

async function handleRfidExit(uid) {
  const usuario = await findUsuarioByUid(uid);
  socketService.sendOpenBarrier();
  socketService.sendLcdMessage(usuario ? `Hasta pronto ${usuario.nombre}` : 'Salida registrada');
  await logHistorial({
    placaAuto: usuario ? usuario.placa_auto : null,
    rfidUid: uid,
    evento: 'SALIDA',
  });
  return { status: 'ok', usuario };
}

async function registrarUsuarioDesdeTarjeta({ uid, nombre, placa }) {
  const { rows } = await query(
    `INSERT INTO usuarios (rfid_uid, nombre, placa_auto)
     VALUES ($1, $2, $3) RETURNING *`,
    [uid, nombre, placa]
  );
  const usuario = rows[0];
  const resultado = await intentarAbrirEntrada(usuario);
  return { usuario, ...resultado };
}

module.exports = {
  COLOR_BY_ESTADO,
  getAllCajones,
  countByEstado,
  broadcastEstadoActual,
  setCajonEstado,
  logHistorial,
  countReservasActivas,
  crearReserva,
  procesarLecturasIR,
  findUsuarioByUid,
  handleRfidEntry,
  handleRfidExit,
  registrarUsuarioDesdeTarjeta,
};
